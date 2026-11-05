import "server-only";

import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { kirimNotifikasi } from "@/features/notifikasi/application/kirim-notifikasi";
import { buatAkunWargaData } from "@/features/warga/application/warga-use-cases";
import type { KredensialWarga } from "@/features/warga/domain/warga";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

import { REGISTRASI_WARGA_RESOURCE, registrasiWargaSchema } from "../domain/registrasi-warga";
import {
  createRegistrasiWarga,
  findRegistrasiMenunggu,
  findRegistrasiWarga,
  findResidentByNik,
  hasWargaAccount,
  listRegistrasiWarga,
  updateStatusRegistrasiWarga,
} from "../infrastructure/registrasi-warga-repository";

/**
 * Warga mengajukan akun layanan mandiri lewat situs publik.
 *
 * `villageId` wajib berasal dari host. NIK harus cocok dengan penduduk hidup di
 * desa tersebut dan belum memiliki akun atau permohonan yang masih menunggu.
 */
export async function kirimRegistrasiWarga(villageId: number, input: unknown): Promise<number> {
  const parsed = registrasiWargaSchema.parse(input);
  const resident = await findResidentByNik(villageId, parsed.nik);

  if (!resident) {
    throw validationError("NIK tidak terdaftar pada desa ini.", {
      nik: ["Periksa kembali NIK Anda atau hubungi kantor desa."],
    });
  }

  if (resident.lifeStatus !== "alive") {
    throw conflict("NIK tersebut tidak berstatus penduduk hidup.");
  }

  if (await hasWargaAccount(villageId, resident.id)) {
    throw conflict("Penduduk dengan NIK tersebut sudah memiliki akun layanan mandiri.");
  }

  if (await findRegistrasiMenunggu(villageId, parsed.nik)) {
    throw conflict("Permohonan akun dengan NIK tersebut masih menunggu pemeriksaan.");
  }

  const id = await createRegistrasiWarga({
    villageId,
    nik: parsed.nik,
    nama: parsed.nama,
    noHp: parsed.noHp ?? null,
  });

  await recordAuditEvent({
    villageId,
    event: AUDIT_EVENTS.registrasiWargaDiajukan,
    resource: REGISTRASI_WARGA_RESOURCE,
    resourceId: String(id),
    details: { status: "menunggu" },
  });

  return id;
}

export async function daftarRegistrasiWargaData() {
  const user = await requirePermission(REGISTRASI_WARGA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  const rows = await listRegistrasiWarga(villageId);
  return rows.map((row) => ({ ...row, status: row.status ?? "menunggu" }));
}

/**
 * Setujui permohonan: buat akun warga (NIK + PIN) dan tandai permohonan selesai.
 *
 * PIN dikembalikan sekali agar operator dapat menyerahkannya kepada warga.
 */
export async function setujuiRegistrasiWargaData(id: number): Promise<KredensialWarga> {
  const user = await requirePermission(REGISTRASI_WARGA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const permohonan = await findRegistrasiWarga(villageId, id);

  if (!permohonan) throw notFound("Permohonan akun tidak ditemukan.");
  if (permohonan.status !== "menunggu") throw conflict("Permohonan akun sudah diproses.");

  const resident = await findResidentByNik(villageId, permohonan.nik);
  if (!resident) throw conflict("NIK pada permohonan tidak lagi terdaftar sebagai penduduk desa.");
  if (resident.lifeStatus !== "alive") throw conflict("Penduduk tersebut tidak berstatus hidup.");
  if (await hasWargaAccount(villageId, resident.id)) {
    throw conflict("Penduduk tersebut sudah memiliki akun layanan mandiri.");
  }

  const kredensial = await buatAkunWargaData(resident.id);
  await updateStatusRegistrasiWarga(villageId, id, "disetujui");

  if (permohonan.noHp) {
    await kirimNotifikasi({
      villageId,
      residentId: resident.id,
      jenis: "registrasi-warga.disetujui",
      kanal: "whatsapp",
      target: permohonan.noHp,
      subjek: "Akun Layanan Mandiri disetujui",
      pesan:
        "Pengajuan akun Layanan Mandiri Anda disetujui. Hubungi operator desa untuk menerima PIN sementara, lalu ganti PIN saat pertama masuk.",
    });
  }
  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.registrasiWargaDisetujui,
    resource: REGISTRASI_WARGA_RESOURCE,
    resourceId: String(id),
    details: { residentId: resident.id },
  });
  return kredensial;
}

export async function tolakRegistrasiWargaData(id: number): Promise<void> {
  const user = await requirePermission(REGISTRASI_WARGA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const permohonan = await findRegistrasiWarga(villageId, id);

  if (!permohonan) throw notFound("Permohonan akun tidak ditemukan.");
  if (permohonan.status !== "menunggu") throw conflict("Permohonan akun sudah diproses.");

  await updateStatusRegistrasiWarga(villageId, id, "ditolak");

  if (permohonan.noHp) {
    await kirimNotifikasi({
      villageId,
      residentId: null,
      jenis: "registrasi-warga.ditolak",
      kanal: "whatsapp",
      target: permohonan.noHp,
      subjek: "Pengajuan akun Layanan Mandiri ditolak",
      pesan:
        "Pengajuan akun Layanan Mandiri Anda ditolak. Silakan hubungi operator desa untuk informasi lebih lanjut.",
    });
  }

  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.registrasiWargaDitolak,
    resource: REGISTRASI_WARGA_RESOURCE,
    resourceId: String(id),
  });
}
