import "server-only";

import { asc } from "drizzle-orm";

import { db } from "@/db";
import { config } from "@/db/schema";

/** Identitas desa (dipakai pada shell, kop surat, dsb.). */
export interface IdentitasDesa {
  id: number;
  namaDesa: string | null;
  kodeDesa: string | null;
  kodePos: string | null;
  namaKecamatan: string | null;
  kodeKecamatan: string | null;
  namaKabupaten: string | null;
  kodeKabupaten: string | null;
  namaPropinsi: string | null;
  kodePropinsi: string | null;
  alamatKantor: string | null;
  emailDesa: string | null;
  telepon: string | null;
  website: string | null;
  logo: string | null;
}

const identitasColumns = {
  id: config.id,
  namaDesa: config.namaDesa,
  kodeDesa: config.kodeDesa,
  kodePos: config.kodePos,
  namaKecamatan: config.namaKecamatan,
  kodeKecamatan: config.kodeKecamatan,
  namaKabupaten: config.namaKabupaten,
  kodeKabupaten: config.kodeKabupaten,
  namaPropinsi: config.namaPropinsi,
  kodePropinsi: config.kodePropinsi,
  alamatKantor: config.alamatKantor,
  emailDesa: config.emailDesa,
  telepon: config.telepon,
  website: config.website,
  logo: config.logo,
};

/** Identitas tenant (mode satu-desa: baris pertama). */
export async function getIdentitasDesa(): Promise<IdentitasDesa | null> {
  const [row] = await db.select(identitasColumns).from(config).orderBy(asc(config.id)).limit(1);
  return row ?? null;
}
