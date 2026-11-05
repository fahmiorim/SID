import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { requirePermission, requireWarga, requireWargaAktif } from "@/lib/dal";
import { notFound } from "@/lib/errors";

import {
  izinWargaSchema,
  parseHariLibur,
  pengaturanKehadiranSchema,
  putusanIzinSchema,
  type IzinDTO,
} from "../domain/izin";
import {
  createIzin,
  getPengaturanKehadiran,
  listIzinAdmin,
  listIzinWarga,
  putuskanIzin,
  simpanPengaturanKehadiran,
} from "../infrastructure/izin-repository";

type BarisIzin = {
  id: number;
  jenis: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  status: string;
  catatanOperator: string | null;
};

function keDTO(
  row: BarisIzin & { namaPemohon?: string | null; nikPemohon?: string | null },
): IzinDTO {
  return {
    id: row.id,
    jenis: (row.jenis as IzinDTO["jenis"]) ?? "izin",
    tanggalMulai: row.tanggalMulai,
    tanggalSelesai: row.tanggalSelesai,
    alasan: row.alasan,
    status: (row.status as IzinDTO["status"]) ?? "menunggu",
    catatanOperator: row.catatanOperator,
    namaPemohon: row.namaPemohon ?? undefined,
    nikPemohon: row.nikPemohon ?? undefined,
  };
}

/** Warga mengajukan izin; `residentId` dari sesi. */
export async function ajukanIzinWargaData(input: unknown): Promise<{ id: number }> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const parsed = izinWargaSchema.parse(input);

  const id = await createIzin({
    villageId,
    residentId: user.residentId,
    jenis: parsed.jenis,
    tanggalMulai: parsed.tanggalMulai,
    tanggalSelesai: parsed.tanggalSelesai,
    alasan: parsed.alasan,
    status: "menunggu",
  });

  return { id };
}

/** Riwayat izin milik warga yang login. */
export async function daftarIzinWargaData(): Promise<IzinDTO[]> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  const rows = await listIzinWarga(villageId, user.residentId);
  return rows.map((row) =>
    keDTO({ ...row, tanggalMulai: row.tanggalMulai, tanggalSelesai: row.tanggalSelesai }),
  );
}

/** Daftar izin untuk operator + rekap status bulan terpilih. */
export async function daftarIzinAdminData(filter: {
  bulan?: number;
  tahun?: number;
  status?: string;
}) {
  const user = await requirePermission("kehadiran", "read");
  const villageId = await resolveVillageId(user);
  const rows = await listIzinAdmin(villageId, filter);
  const items = rows.map(keDTO);

  return {
    items,
    rekap: {
      menunggu: items.filter((item) => item.status === "menunggu").length,
      disetujui: items.filter((item) => item.status === "disetujui").length,
      ditolak: items.filter((item) => item.status === "ditolak").length,
      berdasarkanJenis: {
        izin: items.filter((item) => item.jenis === "izin").length,
        sakit: items.filter((item) => item.jenis === "sakit").length,
        cuti: items.filter((item) => item.jenis === "cuti").length,
      },
    },
  };
}

/** Setujui/tolak pengajuan izin. */
export async function putuskanIzinData(input: unknown): Promise<void> {
  const user = await requirePermission("kehadiran", "update");
  const villageId = await resolveVillageId(user);
  const parsed = putusanIzinSchema.parse(input);

  const daftar = await listIzinAdmin(villageId);
  if (!daftar.some((item) => item.id === parsed.id))
    throw notFound("Pengajuan izin tidak ditemukan.");

  await putuskanIzin(villageId, parsed.id, parsed.status, parsed.catatan?.trim() || null, user.id);
}

export async function pengaturanKehadiranData() {
  const user = await requirePermission("kehadiran", "read");
  const villageId = await resolveVillageId(user);
  const row = await getPengaturanKehadiran(villageId);

  return {
    jamMasuk: row?.jamMasuk ?? "08:00",
    jamKeluar: row?.jamKeluar ?? "16:00",
    hariLibur: parseHariLibur(row?.hariLibur ?? null),
  };
}

export async function simpanPengaturanKehadiranData(input: {
  jamMasuk: unknown;
  jamKeluar: unknown;
  hariLibur: number[];
}): Promise<void> {
  const user = await requirePermission("kehadiran", "update");
  const villageId = await resolveVillageId(user);
  const parsed = pengaturanKehadiranSchema.parse(input);

  await simpanPengaturanKehadiran({
    villageId,
    jamMasuk: parsed.jamMasuk,
    jamKeluar: parsed.jamKeluar,
    hariLibur: JSON.stringify(parsed.hariLibur),
    diperbaruiOleh: user.id,
  });
}
