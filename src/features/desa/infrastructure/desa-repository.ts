import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { villages } from "@/db/schema";
import type { DesaFormInput } from "@/features/desa/domain/desa";

/** Perbarui identitas desa berdasarkan id. */
export async function updateIdentitasDesa(id: number, input: DesaFormInput): Promise<void> {
  await db
    .update(villages)
    .set({
      name: blankToNull(input.namaDesa),
      code: blankToNull(input.kodeDesa),
      postalCode: blankToNull(input.kodePos),
      district: blankToNull(input.namaKecamatan),
      districtCode: blankToNull(input.kodeKecamatan),
      regency: blankToNull(input.namaKabupaten),
      regencyCode: blankToNull(input.kodeKabupaten),
      province: blankToNull(input.namaPropinsi),
      provinceCode: blankToNull(input.kodePropinsi),
      officeAddress: blankToNull(input.alamatKantor),
      headName: blankToNull(input.namaKepalaDesa),
      headNip: blankToNull(input.nipKepalaDesa),
      email: blankToNull(input.emailDesa),
      phone: blankToNull(input.telepon),
      website: blankToNull(input.website),
      logo: blankToNull(input.logo),
      penomoranSurat: input.penomoranSurat,
    })
    .where(eq(villages.id, id));
}

/** Ubah teks kosong menjadi `NULL`. */
function blankToNull(value: string): string | null {
  return value === "" ? null : value;
}

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
  namaKepalaDesa: string | null;
  nipKepalaDesa: string | null;
  emailDesa: string | null;
  telepon: string | null;
  website: string | null;
  logo: string | null;
  /** Domain publik desa (host tanpa protokol), bila sudah dipetakan. */
  domain: string | null;
  /** Mode penomoran surat layanan (1–4). */
  penomoranSurat: number;
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
  namaKepalaDesa: villages.headName,
  nipKepalaDesa: villages.headNip,
  emailDesa: villages.email,
  telepon: villages.phone,
  website: villages.website,
  logo: villages.logo,
  domain: villages.domain,
  penomoranSurat: villages.penomoranSurat,
};

/** Identitas desa berdasarkan tenant. */
export async function getIdentitasDesa(villageId: number): Promise<IdentitasDesa | null> {
  const [row] = await db
    .select(identitasColumns)
    .from(villages)
    .where(eq(villages.id, villageId))
    .limit(1);
  return row ?? null;
}

/** Id desa pertama. Hanya untuk fallback mode satu-desa/administrasi. */
export async function getFirstVillageId(): Promise<number | null> {
  const [row] = await db
    .select({ id: villages.id })
    .from(villages)
    .orderBy(asc(villages.id))
    .limit(1);
  return row?.id ?? null;
}

/**
 * Daftar id + domain seluruh desa, terurut menaik berdasarkan id.
 *
 * Dipakai resolver host (`resolveVillageByHost`) untuk menyusun peta domain
 * sekali per permintaan, alih-alih satu query per kandidat host. Ukurannya
 * satu baris per desa sehingga murah bahkan untuk ratusan desa.
 */
export async function listVillageDomains(): Promise<{ id: number; domain: string | null }[]> {
  return db
    .select({ id: villages.id, domain: villages.domain })
    .from(villages)
    .orderBy(asc(villages.id));
}
