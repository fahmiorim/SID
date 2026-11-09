"use server";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  buildKiaCsv,
  hitungSkorcardKia,
  KIA_RESOURCE,
  kiaRekapFilename,
} from "@/features/kesehatan/domain/kesehatan";
import {
  createBulananAnak,
  createIbuHamil,
  createKia,
  createPosyandu,
  deleteBulananAnak,
  deleteIbuHamil,
  deleteKia,
  deletePosyandu,
  listBulananAnak,
  listIbuHamil,
  listKia,
  listPosyandu,
  updateBulananAnak,
  updateIbuHamil,
  updateKia,
  updatePosyandu,
} from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { listPendudukOptions } from "@/features/penduduk/infrastructure/penduduk-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { requirePermission, verifySession } from "@/lib/dal";

/** Data halaman pemantauan anak (bulanan) beserta opsi posyandu dan KIA; izin baca KIA diperiksa di sini. */
export async function muatPemantauanAnakData(villageId: number) {
  await requirePermission(KIA_RESOURCE, "read");
  return Promise.all([listBulananAnak(villageId), listPosyandu(villageId), listKia(villageId)]);
}

/** Data halaman pemantauan ibu hamil beserta opsi posyandu dan KIA; izin baca KIA diperiksa di sini. */
export async function muatPemantauanIbuHamilData(villageId: number) {
  await requirePermission(KIA_RESOURCE, "read");
  return Promise.all([listIbuHamil(villageId), listPosyandu(villageId), listKia(villageId)]);
}

/** Data halaman KIA beserta opsi penduduk dan posyandu; izin baca KIA diperiksa di sini. */
export async function muatKiaData(villageId: number) {
  await requirePermission(KIA_RESOURCE, "read");
  return Promise.all([listKia(villageId), listPendudukOptions(villageId), listPosyandu(villageId)]);
}

/** Daftar posyandu desa untuk halaman admin; izin baca KIA diperiksa di sini. */
export async function daftarPosyanduData(villageId: number) {
  await requirePermission(KIA_RESOURCE, "read");
  return listPosyandu(villageId);
}

/** Tulis data posyandu, KIA, ibu hamil, dan bulanan anak; izin dan tenant diperiksa pemanggil. */
export async function tambahPosyandu(input: Parameters<typeof createPosyandu>[0]) {
  return createPosyandu(input);
}
export async function ubahPosyandu(
  id: number,
  villageId: number,
  input: Parameters<typeof updatePosyandu>[2],
) {
  return updatePosyandu(id, villageId, input);
}
export async function hapusPosyandu(id: number, villageId: number) {
  return deletePosyandu(id, villageId);
}
export async function tambahKia(input: Parameters<typeof createKia>[0]) {
  return createKia(input);
}
export async function ubahKia(
  id: number,
  villageId: number,
  input: Parameters<typeof updateKia>[2],
) {
  return updateKia(id, villageId, input);
}
export async function hapusKia(id: number, villageId: number) {
  return deleteKia(id, villageId);
}
export async function tambahIbuHamil(input: Parameters<typeof createIbuHamil>[0]) {
  return createIbuHamil(input);
}
export async function ubahIbuHamil(
  id: number,
  villageId: number,
  input: Parameters<typeof updateIbuHamil>[2],
) {
  return updateIbuHamil(id, villageId, input);
}
export async function hapusIbuHamil(id: number, villageId: number) {
  return deleteIbuHamil(id, villageId);
}
export async function tambahBulananAnak(input: Parameters<typeof createBulananAnak>[0]) {
  return createBulananAnak(input);
}
export async function ubahBulananAnak(
  id: number,
  villageId: number,
  input: Parameters<typeof updateBulananAnak>[2],
) {
  return updateBulananAnak(id, villageId, input);
}
export async function hapusBulananAnak(id: number, villageId: number) {
  return deleteBulananAnak(id, villageId);
}

/** Ekspor rekapitulasi KIA sebagai CSV dengan filter opsional status gizi/tikar dan posyandu. */
export async function exportRekapKia(
  params: {
    statusGizi?: number;
    statusTikar?: number;
    posyanduId?: number;
  } = {},
): Promise<{ csv: string; filename: string }> {
  const user = await verifySession();
  if (!user) {
    throw new Error("Sesi Anda telah berakhir.");
  }

  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    throw new Error("Anda tidak memiliki hak akses.");
  }

  const villageId = await resolveVillageId(user);

  // Ambil data bulanan anak sebagai sumber utama (ada statusGizi dan statusTikar)
  const bulananRows = await listBulananAnak(villageId);

  // Filter berdasarkan params jika ada
  let filteredBulanan = bulananRows;
  if (params.statusGizi !== undefined) {
    filteredBulanan = filteredBulanan.filter((row) => row.statusGizi === params.statusGizi);
  }
  if (params.statusTikar !== undefined) {
    filteredBulanan = filteredBulanan.filter((row) => row.statusTikar === params.statusTikar);
  }

  // Dapatkan detail KIA untuk No KIA dan Ibu nama
  const kiaRows = await listKia(villageId);
  const kiaMap = new Map(kiaRows.map((row) => [row.id, row]));

  // Dapatkan posyandu options untuk CSV labeling
  const posyanduRows = await listPosyandu(villageId);
  const posyanduMap = new Map(posyanduRows.map((p) => [p.id, p.nama]));

  // Build CSV rows from filtered bulanan anak rows
  const csvRows = filteredBulanan.map((row) => ({
    statusGizi: row.statusGizi,
    statusTikar: row.statusTikar,
    posyanduId: row.posyanduId as number | undefined,
    posyanduName: row.posyanduId !== undefined ? posyanduMap.get(row.posyanduId) || "-" : "-",
    ibuName: kiaMap.get(row.kiaId)?.ibuName ?? "-",
    konversi:
      row.statusGizi === 4 || row.statusTikar === 4
        ? "Tinggi"
        : row.statusGizi >= 3 || row.statusTikar >= 3
          ? "Sedang"
          : "Rendah",
  }));

  // Hitung skorcard dari filtered rows
  const skorcard = hitungSkorcardKia(
    csvRows.map((row) => ({
      statusGizi: row.statusGizi,
      statusTikar: row.statusTikar,
      posyanduId: row.posyanduId,
    })),
  );

  return {
    csv: buildKiaCsv({
      namaDesa: null, // akan diisi dari identitas desa jika perlu
      judulPemilihan: "KIA - Kesehatan Ibu dan Anak",
      tanggalPemilihan: new Date().toISOString().slice(0, 10),
      rows: csvRows,
      total: skorcard.total,
      stunting: skorcard.stunting,
      konversiPersentase: skorcard.konversi,
    }),
    filename: kiaRekapFilename(null),
  };
}
