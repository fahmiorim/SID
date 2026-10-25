import "server-only";

import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { dtks, dtksAnggota, families, regions, residents, rumahTangga } from "@/db/schema";
import {
  type DtksAnggotaRow,
  type DtksDetailDTO,
  type DtksListRow,
  type DtksVersi,
  type ListDtksParams,
  type ListDtksResult,
} from "@/features/penduduk/domain/dtks";

export async function listDtks(villageId: number, params: ListDtksParams): Promise<ListDtksResult> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 10));
  const offset = (page - 1) * perPage;

  const filters: SQL[] = [eq(dtks.villageId, villageId)];

  if (params.status) {
    filters.push(eq(dtks.status, params.status));
  }
  if (params.dusun) {
    filters.push(eq(regions.dusun, params.dusun));
  }
  if (params.search) {
    const term = `%${params.search}%`;
    filters.push(
      or(
        like(rumahTangga.number, term),
        like(residents.name, term),
        like(residents.nationalId, term),
      )!,
    );
  }

  const where = and(...filters);

  const [totalRes, kepalaRtmList, anggotaCounts] = await Promise.all([
    db
      .select({ value: count() })
      .from(dtks)
      .innerJoin(rumahTangga, eq(dtks.rtmId, rumahTangga.id))
      .leftJoin(families, eq(dtks.keluargaId, families.id))
      .leftJoin(regions, eq(rumahTangga.regionId, regions.id))
      .where(where),
    // Ambil kepala RTM
    db
      .select({
        rtmId: rumahTangga.id,
        nama: residents.name,
        nik: residents.nationalId,
      })
      .from(rumahTangga)
      .innerJoin(residents, and(eq(residents.rtmId, rumahTangga.id), eq(residents.rtmLevel, 1)))
      .where(eq(rumahTangga.villageId, villageId)),
    // Hitung jumlah anggota DTKS per form
    db
      .select({
        dtksId: dtksAnggota.dtksId,
        count: count(),
      })
      .from(dtksAnggota)
      .where(eq(dtksAnggota.villageId, villageId))
      .groupBy(dtksAnggota.dtksId),
  ]);

  const total = totalRes[0]?.value ?? 0;
  const kepalaMap = new Map(kepalaRtmList.map((k) => [k.rtmId, { name: k.nama, nik: k.nik }]));
  const countMap = new Map(anggotaCounts.map((c) => [c.dtksId, c.count]));

  const detailedRows = await db
    .select({
      id: dtks.id,
      rtmId: dtks.rtmId,
      villageId: dtks.villageId,
      rtmNumber: rumahTangga.number,
      dusun: regions.dusun,
      rw: regions.rw,
      rt: regions.rt,
      versiKuisioner: dtks.versiKuisioner,
      status: dtks.status,
      updatedAt: dtks.updatedAt,
      keluargaNumber: families.number,
    })
    .from(dtks)
    .innerJoin(rumahTangga, eq(dtks.rtmId, rumahTangga.id))
    .leftJoin(families, eq(dtks.keluargaId, families.id))
    .leftJoin(regions, eq(rumahTangga.regionId, regions.id))
    .where(where)
    .orderBy(desc(dtks.updatedAt))
    .limit(perPage)
    .offset(offset);

  const mappedRows: DtksListRow[] = detailedRows.map((r) => {
    const krt = kepalaMap.get(r.rtmId);
    return {
      id: r.id,
      villageId: r.villageId,
      rtmNumber: r.rtmNumber,
      rtmKepalaName: krt?.name ?? "-",
      rtmKepalaNik: krt?.nik ?? null,
      keluargaNumber: r.keluargaNumber ?? null,
      keluargaKepalaName: null,
      dusun: r.dusun ?? null,
      rw: r.rw ?? null,
      rt: r.rt ?? null,
      versiKuisioner: r.versiKuisioner,
      status: r.status,
      anggotaCount: countMap.get(r.id) ?? 0,
      updatedAt: r.updatedAt.toISOString(),
    };
  });

  return {
    rows: mappedRows,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getDtksDetail(villageId: number, id: number): Promise<DtksDetailDTO | null> {
  const row = await db
    .select()
    .from(dtks)
    .where(and(eq(dtks.id, id), eq(dtks.villageId, villageId)))
    .limit(1);

  if (!row[0]) return null;

  return {
    ...row[0],
    tanggalPencacahan: row[0].tanggalPencacahan,
    tanggalPemeriksaan: row[0].tanggalPemeriksaan,
    createdAt: row[0].createdAt.toISOString(),
    updatedAt: row[0].updatedAt.toISOString(),
  };
}

export async function listDtksAnggota(
  villageId: number,
  dtksId: number,
): Promise<DtksAnggotaRow[]> {
  const rows = await db
    .select({
      id: dtksAnggota.id,
      pendudukId: dtksAnggota.pendudukId,
      name: residents.name,
      nationalId: residents.nationalId,
      gender: residents.gender,
      birthDate: residents.birthDate,
      hubunganId: dtksAnggota.hubunganId,
      statusAnggota: dtksAnggota.statusAnggota,
      keterangan: dtksAnggota.keterangan,
    })
    .from(dtksAnggota)
    .innerJoin(residents, eq(dtksAnggota.pendudukId, residents.id))
    .where(and(eq(dtksAnggota.dtksId, dtksId), eq(dtksAnggota.villageId, villageId)));

  return rows;
}

/** Buat DTKS baru dari RTM atau sinkronisasi anggota RTM ke anggota DTKS. */
export async function createOrGetDtks(
  villageId: number,
  rtmId: number,
  versiKuisioner: DtksVersi = "regsos_ek2022_k",
): Promise<number> {
  // Cek apakah sudah ada
  const existing = await db
    .select({ id: dtks.id })
    .from(dtks)
    .where(
      and(
        eq(dtks.villageId, villageId),
        eq(dtks.rtmId, rtmId),
        eq(dtks.versiKuisioner, versiKuisioner),
      ),
    )
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  // Buat baru
  const [created] = await db.insert(dtks).values({
    villageId,
    rtmId,
    versiKuisioner,
    status: "draf",
  });

  const dtksId = Number(created.insertId);

  // Otomatis masukkan seluruh penduduk dalam RTM ke dtks_anggota
  const rtmResidents = await db
    .select({ id: residents.id })
    .from(residents)
    .where(and(eq(residents.villageId, villageId), eq(residents.rtmId, rtmId)));

  if (rtmResidents.length > 0) {
    await db.insert(dtksAnggota).values(
      rtmResidents.map((res) => ({
        villageId,
        dtksId,
        pendudukId: res.id,
        statusAnggota: "aktif",
      })),
    );
  }

  return dtksId;
}

export async function deleteDtks(villageId: number, id: number): Promise<void> {
  await db.delete(dtks).where(and(eq(dtks.id, id), eq(dtks.villageId, villageId)));
}
