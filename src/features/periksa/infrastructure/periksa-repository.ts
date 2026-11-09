import "server-only";

import { and, asc, eq, isNotNull, isNull, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { families } from "@/db/schema/family";
import { modules } from "@/db/schema/rbac";
import { residents } from "@/db/schema/resident";
import { HEAD_OF_FAMILY_RELATION_ID } from "@/features/penduduk/domain/penduduk";

import { jenisPemeriksaan, type TemuanPemeriksaan } from "../domain/periksa";

const JUMLAH_CONTOH = 5;

interface ContohBaris {
  id: number;
  label: string;
}

/** Query mentah satu pemeriksaan: jumlah total + contoh baris. */
interface HasilQuery {
  jumlah: number;
  contoh: ContohBaris[];
}

function keHasil(rows: ContohBaris[], jumlah: number): HasilQuery {
  return { jumlah, contoh: rows.slice(0, JUMLAH_CONTOH) };
}

async function hitungPenduduk(
  villageId: number,
  kondisi: Parameters<typeof and>[0],
  label: (row: { name: string; nationalId: string | null }) => string,
): Promise<HasilQuery> {
  const where = and(eq(residents.villageId, villageId), kondisi);

  const [[total], contoh] = await Promise.all([
    db
      .select({ jumlah: sql<number>`count(*)` })
      .from(residents)
      .where(where),
    db
      .select({ id: residents.id, name: residents.name, nationalId: residents.nationalId })
      .from(residents)
      .where(where)
      .orderBy(asc(residents.name), asc(residents.id))
      .limit(JUMLAH_CONTOH),
  ]);

  return keHasil(
    contoh.map((row) => ({ id: row.id, label: label(row) })),
    Number(total?.jumlah ?? 0),
  );
}

async function periksaPenduduk(villageId: number): Promise<TemuanPemeriksaan[]> {
  const [tanpaNik, nikTidakValid, tanpaTanggalLahir, tanpaKk, tanpaHubungan] = await Promise.all([
    hitungPenduduk(
      villageId,
      or(isNull(residents.nationalId), eq(residents.nationalId, "")),
      (row) => row.name,
    ),
    hitungPenduduk(
      villageId,
      and(
        isNotNull(residents.nationalId),
        ne(residents.nationalId, ""),
        sql`${residents.nationalId} NOT REGEXP '^[0-9]{16}$'`,
      ),
      (row) => `${row.name} (${row.nationalId ?? "-"})`,
    ),
    hitungPenduduk(villageId, isNull(residents.birthDate), (row) => row.name),
    hitungPenduduk(villageId, isNull(residents.familyId), (row) => row.name),
    hitungPenduduk(villageId, isNull(residents.familyRelationId), (row) => row.name),
  ]);

  return susunTemuan({
    "penduduk-tanpa-nik": tanpaNik,
    "penduduk-nik-tidak-valid": nikTidakValid,
    "penduduk-tanpa-tanggal-lahir": tanpaTanggalLahir,
    "penduduk-tanpa-kk": tanpaKk,
    "penduduk-tanpa-hubungan": tanpaHubungan,
  });
}

async function periksaKeluarga(villageId: number): Promise<TemuanPemeriksaan[]> {
  const kepala = sql`sum(case when ${residents.familyRelationId} = ${HEAD_OF_FAMILY_RELATION_ID} then 1 else 0 end)`;

  // Satu query mengambil keluarga beserta jumlah anggota dan jumlah kepala,
  // lalu baris bermasalah dipilah ke tiga jenis pemeriksaan.
  const rows = await db
    .select({
      id: families.id,
      number: families.number,
      anggota: sql<number>`count(${residents.id})`,
      kepala: sql<number>`${kepala}`,
    })
    .from(families)
    .leftJoin(residents, eq(residents.familyId, families.id))
    .where(eq(families.villageId, villageId))
    .groupBy(families.id, families.number)
    .having(sql`count(${residents.id}) = 0 or ${kepala} <> 1`);

  const tanpaAnggota: HasilQuery = { jumlah: 0, contoh: [] };
  const tanpaKepala: HasilQuery = { jumlah: 0, contoh: [] };
  const kepalaGanda: HasilQuery = { jumlah: 0, contoh: [] };

  for (const row of rows) {
    const baris = { id: row.id, label: `KK ${row.number}` };
    const anggota = Number(row.anggota);
    const jumlahKepala = Number(row.kepala ?? 0);

    if (anggota === 0) {
      tanpaAnggota.jumlah += 1;
      if (tanpaAnggota.contoh.length < JUMLAH_CONTOH) tanpaAnggota.contoh.push(baris);
    } else if (jumlahKepala === 0) {
      tanpaKepala.jumlah += 1;
      if (tanpaKepala.contoh.length < JUMLAH_CONTOH) tanpaKepala.contoh.push(baris);
    } else if (jumlahKepala > 1) {
      kepalaGanda.jumlah += 1;
      if (kepalaGanda.contoh.length < JUMLAH_CONTOH) kepalaGanda.contoh.push(baris);
    }
  }

  return susunTemuan({
    "keluarga-tanpa-anggota": tanpaAnggota,
    "keluarga-tanpa-kepala": tanpaKepala,
    "keluarga-kepala-ganda": kepalaGanda,
  });
}

async function periksaMenu(villageId: number): Promise<TemuanPemeriksaan[]> {
  const rows = await db
    .select({
      id: modules.id,
      name: modules.name,
      parentId: modules.parentId,
    })
    .from(modules)
    .where(eq(modules.villageId, villageId));

  const ids = new Set(rows.map((row) => row.id));
  const yatim = rows.filter((row) => {
    const parentId = Number(row.parentId ?? 0);
    return parentId !== 0 && !ids.has(parentId);
  });

  return susunTemuan({
    "menu-tanpa-induk": keHasil(
      yatim.map((row) => ({ id: row.id, label: row.name })),
      yatim.length,
    ),
  });
}

function susunTemuan(hasil: Record<string, HasilQuery>): TemuanPemeriksaan[] {
  return Object.entries(hasil).flatMap(([kode, item]) => {
    const jenis = jenisPemeriksaan(kode);
    if (!jenis) return [];
    return [
      {
        kode: jenis.kode,
        nama: jenis.nama,
        kategori: jenis.kategori,
        keterangan: jenis.keterangan,
        perbaikan: jenis.perbaikan,
        jumlah: item.jumlah,
        contoh: item.contoh,
      },
    ];
  });
}

/** Menjalankan seluruh pemeriksaan untuk satu desa. */
export async function kumpulkanTemuan(villageId: number): Promise<TemuanPemeriksaan[]> {
  const [penduduk, keluarga, menu] = await Promise.all([
    periksaPenduduk(villageId),
    periksaKeluarga(villageId),
    periksaMenu(villageId),
  ]);

  return [...penduduk, ...keluarga, ...menu];
}
