import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  DOKUMEN_RESOURCE,
  type DokumenPublikFormInput,
  type DokumenRow,
} from "@/features/konten/domain/dokumen";
import { buatSlug } from "@/features/publik/domain/slug";
import {
  createDokumenPublik,
  deleteDokumenPublik,
  dokumenSlugExists,
  listDokumenPublik,
  updateDokumenPublik,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/** Daftar seluruh dokumen desa, termasuk yang nonaktif, untuk halaman admin. */
export async function daftarDokumenAdmin(): Promise<DokumenRow[]> {
  const user = await requirePermission(DOKUMEN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listDokumenPublik(villageId, undefined, true);
}

/** Simpan dokumen baru atau ubah dokumen yang sudah ada. */
export async function simpanDokumen(input: DokumenPublikFormInput, id?: number): Promise<void> {
  const user = await requirePermission(DOKUMEN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listDokumenPublik(villageId, undefined, true);

  if (id !== undefined && !rows.some((row) => row.id === id)) {
    throw notFound("Dokumen yang akan diubah tidak ditemukan.");
  }

  const slug = buatSlug(input.slug || input.nama);
  if (!slug) throw conflict("Slug dokumen tidak valid. Isi slug secara manual.");
  if (await dokumenSlugExists(villageId, slug, id)) {
    throw conflict("Slug dokumen sudah dipakai. Gunakan slug lain.");
  }

  const data = {
    nama: input.nama,
    slug,
    kategori: input.kategori,
    jenis: input.jenis || null,
    nomor: input.nomor || null,
    tahun: input.tahun ?? null,
    berkas: input.berkas || null,
    tautan: input.tautan || null,
    keterangan: input.keterangan || null,
    aktif: input.aktif,
  };

  if (id === undefined) {
    await createDokumenPublik(villageId, data);
    return;
  }

  await updateDokumenPublik(villageId, id, data);
}

export async function hapusDokumen(id: number): Promise<void> {
  const user = await requirePermission(DOKUMEN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const rows = await listDokumenPublik(villageId, undefined, true);

  if (!rows.some((row) => row.id === id)) {
    throw notFound("Dokumen yang akan dihapus tidak ditemukan.");
  }

  await deleteDokumenPublik(villageId, id);
}
