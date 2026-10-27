"use server";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  buildKiaCsv,
  hitungSkorcardKia,
  KIA_RESOURCE,
  kiaRekapFilename,
} from "@/features/kesehatan/domain/kesehatan";
import {
  listBulananAnak,
  listKia,
  listPosyandu,
} from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

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
