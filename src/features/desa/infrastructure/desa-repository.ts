import "server-only";

import { asc } from "drizzle-orm";

import { db } from "@/db";
import { villages } from "@/db/schema";

/**
 * Identitas desa. Nama field mengikuti kosakata domain aplikasi (Indonesia);
 * pemetaan dari kolom basis data (Inggris) terjadi di sini agar lapisan atas
 * tidak perlu tahu detail penyimpanan.
 */
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
  id: villages.id,
  namaDesa: villages.name,
  kodeDesa: villages.code,
  kodePos: villages.postalCode,
  namaKecamatan: villages.district,
  kodeKecamatan: villages.districtCode,
  namaKabupaten: villages.regency,
  kodeKabupaten: villages.regencyCode,
  namaPropinsi: villages.province,
  kodePropinsi: villages.provinceCode,
  alamatKantor: villages.officeAddress,
  emailDesa: villages.email,
  telepon: villages.phone,
  website: villages.website,
  logo: villages.logo,
};

/** Identitas desa (mode satu-desa: baris pertama). */
export async function getIdentitasDesa(): Promise<IdentitasDesa | null> {
  const [row] = await db.select(identitasColumns).from(villages).orderBy(asc(villages.id)).limit(1);
  return row ?? null;
}
