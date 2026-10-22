import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profilDesa } from "@/db/schema";

import type { ProfilDesaAdmin } from "../domain/profil";

/**
 * Akses data profil desa (Fase 1F.4).
 *
 * Tabel `profil_desa` memiliki indeks unik pada `village_id`, sehingga
 * penyimpanan memakai upsert: baris dibuat bila belum ada, diperbarui bila
 * sudah. Tidak ada jalur yang membaca profil desa lain.
 */

const KOSONG: ProfilDesaAdmin = {
  visi: "",
  misi: "",
  sejarah: "",
  sambutan: "",
  koordinat: "",
};

/** Profil desa untuk form admin; nilai kosong dikembalikan sebagai string kosong. */
export async function getProfilAdmin(villageId: number): Promise<ProfilDesaAdmin> {
  const [row] = await db
    .select({
      visi: profilDesa.visi,
      misi: profilDesa.misi,
      sejarah: profilDesa.sejarah,
      sambutan: profilDesa.sambutan,
      koordinat: profilDesa.koordinat,
    })
    .from(profilDesa)
    .where(eq(profilDesa.villageId, villageId))
    .limit(1);

  if (!row) return { ...KOSONG };

  return {
    visi: row.visi ?? "",
    misi: row.misi ?? "",
    sejarah: row.sejarah ?? "",
    sambutan: row.sambutan ?? "",
    koordinat: row.koordinat ?? "",
  };
}

/** Simpan profil desa (buat bila belum ada, perbarui bila sudah). */
export async function upsertProfil(villageId: number, data: ProfilDesaAdmin): Promise<void> {
  const nilai = {
    visi: nullIfEmpty(data.visi),
    misi: nullIfEmpty(data.misi),
    sejarah: nullIfEmpty(data.sejarah),
    sambutan: nullIfEmpty(data.sambutan),
    koordinat: nullIfEmpty(data.koordinat),
  };

  await db
    .insert(profilDesa)
    .values({ villageId, ...nilai })
    .onDuplicateKeyUpdate({ set: nilai });
}

function nullIfEmpty(value: string): string | null {
  return value.trim() === "" ? null : value;
}
