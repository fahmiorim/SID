"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  addSuplemenTerdataUseCase,
  imporSuplemenUseCase,
} from "@/features/penduduk/application/suplemen-use-cases";
import { SUPLEMEN_RESOURCE } from "@/features/penduduk/domain/suplemen";
import {
  KOLOM_IMPOR_SUPLEMEN,
  normalisasiIsian,
  type KunciImporSuplemen,
} from "@/features/penduduk/domain/suplemen-berkas";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";
import { bacaImporDariFormData } from "@/lib/impor-berkas";

/** Nilai teks dari FormData. */
function text(formData: FormData, nama: string): string {
  const nilai = formData.get(nama);
  return typeof nilai === "string" ? nilai.trim() : "";
}

/**
 * Tambah terdata sekaligus dengan isian dinamis.
 *
 * Isian dikirim sebagai pasangan `isianNama[]` / `isianNilai[]` agar pengguna
 * bebas menentukan kolom apa pun untuk suplemen tersebut (mengikuti OpenSID).
 */
export async function tambahTerdataIsianAction(formData: FormData): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, SUPLEMEN_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin menambah terdata." };
  }

  const suplemenId = Number(text(formData, "suplemenId"));
  const sasaran = text(formData, "sasaran");
  if (!Number.isInteger(suplemenId) || suplemenId <= 0) {
    return { ok: false, message: "Suplemen tidak valid." };
  }

  const sasaranId = Number(sasaran);
  if (!Number.isInteger(sasaranId) || sasaranId <= 0) {
    return { ok: false, message: "Pilih sasaran terlebih dahulu." };
  }

  const mode = text(formData, "mode");
  const namaKolom = formData.getAll("isianNama").map((item) => String(item));
  const nilaiKolom = formData.getAll("isianNilai").map((item) => String(item));
  const isian = normalisasiIsian(
    namaKolom.map((nama, indeks) => ({ nama, nilai: nilaiKolom[indeks] ?? "" })),
  );

  const villageId = await resolveVillageId(user);

  try {
    await addSuplemenTerdataUseCase(villageId, {
      suplemenId,
      pendudukId: mode === "keluarga" ? null : sasaranId,
      keluargaId: mode === "keluarga" ? sasaranId : null,
      isian,
    });

    revalidatePath(`/penduduk/suplemen/${suplemenId}`);
    return { ok: true, message: "Terdata ditambahkan." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menambah terdata.",
    };
  }
}

/**
 * Impor terdata dari berkas CSV/XLSX.
 *
 * Kolom tetap hanya "NIK / No. KK" (menyesuaikan sasaran suplemen); kolom lain
 * otomatis disimpan sebagai isian dinamis.
 */
export async function imporTerdataSuplemenAction(formData: FormData): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, SUPLEMEN_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin mengimpor terdata." };
  }

  const suplemenId = Number(text(formData, "suplemenId"));
  if (!Number.isInteger(suplemenId) || suplemenId <= 0) {
    return { ok: false, message: "Suplemen tidak valid." };
  }

  const berkas = formData.get("berkas");
  const hasil = await bacaImporDariFormData<KunciImporSuplemen>(berkas, KOLOM_IMPOR_SUPLEMEN);

  if (!hasil.ok) {
    return { ok: false, message: hasil.pesan };
  }
  if (hasil.hasil.baris.length === 0) {
    const pesan = hasil.hasil.galat[0]?.pesan ?? "Tidak ada baris data pada berkas.";
    return { ok: false, message: pesan };
  }

  // Kolom tak dikenal pada berkas diperlakukan sebagai isian dinamis.
  const rows = hasil.hasil.baris.map((baris) => ({
    sasaran: baris.nilai.sasaran.trim(),
    isian: normalisasiIsian(
      Object.entries(baris.tambahan).map(([nama, nilai]) => ({ nama, nilai })),
    ),
  }));

  const villageId = await resolveVillageId(user);

  try {
    const ringkasan = await imporSuplemenUseCase(villageId, suplemenId, rows);
    revalidatePath(`/penduduk/suplemen/${suplemenId}`);

    const bagian = [`${ringkasan.ditambahkan} ditambahkan`, `${ringkasan.dilewati} dilewati`];
    if (ringkasan.tidakDitemukan.length > 0) {
      bagian.push(`${ringkasan.tidakDitemukan.length} sasaran tidak ditemukan`);
    }

    return { ok: true, message: `Impor selesai: ${bagian.join("; ")}.` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Impor terdata gagal.",
    };
  }
}
