import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  DOKUMEN_RESOURCE,
  type DokumenPublikFormInput,
  type DokumenRow,
} from "@/features/konten/domain/dokumen";
import { simpanBerkasMedia } from "@/features/publik/application/simpan-berkas-media";
import { isPdfDocument } from "@/features/publik/domain/dokumen";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { buatSlug } from "@/features/publik/domain/slug";
import {
  createDokumenPublik,
  deleteDokumenPublik,
  dokumenSlugExists,
  listDokumenPublik,
  updateDokumenPublik,
} from "@/features/publik/infrastructure/content-repository";
import { hapusMedia } from "@/features/publik/infrastructure/media-storage";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

/** Daftar seluruh dokumen desa, termasuk yang nonaktif, untuk halaman admin. */
export async function daftarDokumenAdmin(): Promise<DokumenRow[]> {
  const user = await requirePermission(DOKUMEN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listDokumenPublik(villageId, undefined, true);
}

/** Simpan dokumen baru atau ubah dokumen yang sudah ada. */
export interface SimpanDokumenOptions {
  unggahan?: BerkasUnggahan;
  hapusBerkas?: boolean;
}

/** Simpan dokumen baru atau ubah dokumen yang sudah ada. */
export async function simpanDokumen(
  input: DokumenPublikFormInput,
  id?: number,
  options: SimpanDokumenOptions = {},
): Promise<void> {
  const user = await requirePermission(DOKUMEN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listDokumenPublik(villageId, undefined, true);
  const existing = id === undefined ? undefined : rows.find((row) => row.id === id);

  if (id !== undefined && !existing) {
    throw notFound("Dokumen yang akan diubah tidak ditemukan.");
  }

  const slug = buatSlug(input.slug || input.nama);
  if (!slug) throw conflict("Slug dokumen tidak valid. Isi slug secara manual.");
  if (await dokumenSlugExists(villageId, slug, id)) {
    throw conflict("Slug dokumen sudah dipakai. Gunakan slug lain.");
  }

  if (
    options.unggahan &&
    (options.unggahan.mime?.toLowerCase() !== "application/pdf" ||
      !isPdfDocument(options.unggahan.isi))
  ) {
    throw validationError("Berkas dokumen harus berupa PDF yang valid.", {
      unggahan: ["Unggah berkas PDF yang valid."],
    });
  }

  const pathBerkasLama = existing?.berkas ?? null;
  const pathBerkasBaru = options.unggahan
    ? await simpanBerkasMedia(villageId, options.unggahan, "dokumen", "unggahan")
    : null;
  const berkas =
    pathBerkasBaru ?? (options.hapusBerkas ? null : input.berkas || existing?.berkas || null);
  const tautan = input.tautan || null;

  if (input.aktif && !berkas && !tautan) {
    if (pathBerkasBaru) await hapusMedia(pathBerkasBaru);
    throw validationError("Dokumen aktif harus memiliki berkas atau tautan.", {
      berkas: ["Unggah berkas atau isi tautan sebelum menayangkan dokumen."],
    });
  }

  const data = {
    nama: input.nama,
    slug,
    kategori: input.kategori,
    jenis: input.jenis || null,
    nomor: input.nomor || null,
    tahun: input.tahun ?? null,
    berkas,
    tautan,
    keterangan: input.keterangan || null,
    aktif: input.aktif,
  };

  try {
    if (id === undefined) {
      await createDokumenPublik(villageId, data);
    } else {
      await updateDokumenPublik(villageId, id, data);
    }
  } catch (error) {
    if (pathBerkasBaru) await hapusMedia(pathBerkasBaru);
    throw error;
  }

  if (
    pathBerkasLama &&
    pathBerkasLama !== berkas &&
    pathBerkasLama.startsWith(`${villageId}/dokumen/`)
  ) {
    await hapusMedia(pathBerkasLama);
  }
}

export async function hapusDokumen(id: number): Promise<void> {
  const user = await requirePermission(DOKUMEN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const rows = await listDokumenPublik(villageId, undefined, true);
  const existing = rows.find((row) => row.id === id);

  if (!existing) {
    throw notFound("Dokumen yang akan dihapus tidak ditemukan.");
  }

  await deleteDokumenPublik(villageId, id);
  if (existing.berkas?.startsWith(`${villageId}/dokumen/`)) {
    await hapusMedia(existing.berkas);
  }
}
