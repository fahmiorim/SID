import { hostCandidates, normalizeHost } from "./host";

/**
 * Pemetaan tenant (desa) dari host permintaan (Fase 1B.6).
 *
 * Fungsi di sini murni: tidak menyentuh database, `next/headers`, atau sesi.
 * Tujuannya agar aturan isolasi tenant — host desa A tidak boleh menghasilkan
 * desa B, dan host tak dikenal tidak boleh diam-diam memakai desa lain — dapat
 * diuji tanpa basis data.
 */
export interface PetaDesa {
  /** Domain ternormalisasi → id desa. */
  domain: ReadonlyMap<string, number>;
  /** Jumlah desa pada instalasi. */
  jumlahDesa: number;
  /** Id desa pertama (fallback **hanya** bila instalasi berisi satu desa). */
  desaPertamaId: number | null;
}

/** Satu baris desa yang dibutuhkan resolver host. */
export interface BarisDesa {
  id: number;
  domain: string | null;
}

/**
 * Susun peta domain dari daftar desa.
 *
 * `daftar` harus terurut menaik berdasarkan id agar `desaPertamaId` konsisten
 * dengan `getFirstVillageId()`. Domain disimpan ternormalisasi; baris tanpa
 * domain dilewati. Bila ada domain duplikat (seharusnya dicegah indeks unik),
 * desa dengan id lebih kecil yang dipakai.
 */
export function susunPetaDesa(daftar: readonly BarisDesa[]): PetaDesa {
  const domain = new Map<string, number>();

  for (const desa of daftar) {
    if (!desa.domain) continue;

    const kunci = normalizeHost(desa.domain);
    if (!kunci || domain.has(kunci)) continue;

    domain.set(kunci, desa.id);
  }

  return {
    domain,
    jumlahDesa: daftar.length,
    desaPertamaId: daftar[0]?.id ?? null,
  };
}

/**
 * Tentukan id desa dari host permintaan.
 *
 * Urutan: domain persis → alias `www` → fallback satu-desa. Fallback hanya
 * berlaku bila instalasi benar-benar berisi satu desa; pada instalasi
 * multi-desa, host tak dikenal menghasilkan `null` (pemanggil menerjemahkannya
 * menjadi 404) sehingga tenant tidak bocor.
 */
export function villageIdDariHost(host: string | null | undefined, peta: PetaDesa): number | null {
  for (const kandidat of hostCandidates(host)) {
    const id = peta.domain.get(kandidat);
    if (id !== undefined) return id;
  }

  return peta.jumlahDesa === 1 ? peta.desaPertamaId : null;
}
