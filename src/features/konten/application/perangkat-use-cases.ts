import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { simpanBerkasMedia } from "@/features/publik/application/simpan-berkas-media";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { hapusMedia } from "@/features/publik/infrastructure/media-storage";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

import {
  PERANGKAT_DESA_RESOURCE,
  slugJabatan,
  type JabatanAdminRow,
  type JabatanFormInput,
  type JabatanOption,
  type PerangkatAdmin,
  type PerangkatFormInput,
} from "../domain/perangkat";
import {
  deleteJabatan as deleteJabatanRow,
  deletePerangkat as deletePerangkatRow,
  getPerangkatAdmin,
  insertJabatan,
  insertPerangkat,
  jabatanMilikDesa,
  listJabatanAdmin,
  listJabatanOption,
  listPerangkatAdmin,
  slugJabatanDipakai,
  updateJabatan as updateJabatanRow,
  updatePerangkat as updatePerangkatRow,
  type JabatanSimpan,
  type PerangkatSimpan,
} from "../infrastructure/perangkat-repository";

/**
 * Use case perangkat desa & jabatan (Fase 1F.4).
 *
 * Otorisasi memakai resource `perangkat-desa` untuk keduanya (satu menu).
 * Foto perangkat divalidasi lewat helper media bersama dan berkas lama
 * dibersihkan saat diganti atau saat perangkat dihapus.
 */

export async function listPerangkat(): Promise<PerangkatAdmin[]> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listPerangkatAdmin(villageId);
}

export async function getPerangkat(id: number): Promise<PerangkatAdmin> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const perangkat = await getPerangkatAdmin(villageId, id);
  if (!perangkat) throw notFound("Perangkat desa tidak ditemukan.");
  return perangkat;
}

export async function listJabatan(): Promise<JabatanAdminRow[]> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listJabatanAdmin(villageId);
}

export async function listJabatanPilihan(): Promise<JabatanOption[]> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listJabatanOption(villageId);
}

/* -------------------------------------------------------------------------- */
/* Jabatan                                                                    */
/* -------------------------------------------------------------------------- */

async function slugJabatanBebas(
  villageId: number,
  nama: string,
  kecualiId: number | null,
): Promise<string> {
  const dasar = slugJabatan(nama);

  for (let urutan = 1; urutan <= 200; urutan += 1) {
    const kandidat = urutan === 1 ? dasar : `${dasar}-${urutan}`;
    if (!(await slugJabatanDipakai(villageId, kandidat, kecualiId))) return kandidat;
  }

  throw conflict("Tidak dapat membentuk slug jabatan yang unik.");
}

export async function createJabatan(input: JabatanFormInput): Promise<{ id: number }> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const slug = await slugJabatanBebas(villageId, input.nama, null);
  const data: JabatanSimpan = { nama: input.nama, urut: input.urut };
  const id = await insertJabatan(villageId, slug, data);

  return { id };
}

export async function updateJabatan(id: number, input: JabatanFormInput): Promise<void> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await jabatanMilikDesa(villageId, id))) {
    throw notFound("Jabatan tidak ditemukan.");
  }

  const slug = await slugJabatanBebas(villageId, input.nama, id);
  await updateJabatanRow(id, slug, { nama: input.nama, urut: input.urut });
}

export async function deleteJabatan(id: number): Promise<void> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!(await jabatanMilikDesa(villageId, id))) {
    throw notFound("Jabatan tidak ditemukan.");
  }

  await deleteJabatanRow(id);
}

/* -------------------------------------------------------------------------- */
/* Perangkat                                                                  */
/* -------------------------------------------------------------------------- */

export interface MediaPerangkat {
  /** Foto baru; kosong = pertahankan foto lama. */
  foto?: BerkasUnggahan | null;
}

function kosongNull(value: string): string | null {
  return value.trim() === "" ? null : value;
}

function dataPerangkat(input: PerangkatFormInput, foto: string | null): PerangkatSimpan {
  return {
    nama: input.nama,
    jabatanId: input.jabatanId,
    gelarDepan: kosongNull(input.gelarDepan),
    gelarBelakang: kosongNull(input.gelarBelakang),
    nip: kosongNull(input.nip),
    nik: input.nik,
    jenisKelamin: input.jenisKelamin,
    tempatLahir: kosongNull(input.tempatLahir),
    tanggalLahir: input.tanggalLahir,
    foto,
    penandaTangan: input.penandaTangan,
    status: input.status,
    periode: input.periode,
    urut: input.urut,
  };
}

async function pastikanJabatan(villageId: number, jabatanId: number | null): Promise<void> {
  if (jabatanId === null) return;

  if (!(await jabatanMilikDesa(villageId, jabatanId))) {
    throw validationError("Jabatan tidak tersedia.", {
      jabatanId: ["Jabatan tidak ditemukan di desa ini."],
    });
  }
}

export async function createPerangkat(
  input: PerangkatFormInput,
  media: MediaPerangkat = {},
): Promise<{ id: number }> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await pastikanJabatan(villageId, input.jabatanId);

  const foto = media.foto
    ? await simpanBerkasMedia(villageId, media.foto, "perangkat", "foto")
    : null;

  try {
    const id = await insertPerangkat(villageId, dataPerangkat(input, foto));
    return { id };
  } catch (error) {
    if (foto) await hapusMedia(foto);
    throw error;
  }
}

export async function updatePerangkat(
  id: number,
  input: PerangkatFormInput,
  media: MediaPerangkat = {},
): Promise<void> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const lama = await getPerangkatAdmin(villageId, id);
  if (!lama) throw notFound("Perangkat desa tidak ditemukan.");

  await pastikanJabatan(villageId, input.jabatanId);

  const fotoBaru = media.foto
    ? await simpanBerkasMedia(villageId, media.foto, "perangkat", "foto")
    : null;
  const foto = fotoBaru ?? lama.foto;

  try {
    await updatePerangkatRow(id, dataPerangkat(input, foto));
  } catch (error) {
    if (fotoBaru) await hapusMedia(fotoBaru);
    throw error;
  }

  if (lama.foto && lama.foto !== foto) await hapusMedia(lama.foto);
}

export async function deletePerangkat(id: number): Promise<void> {
  const user = await requirePermission(PERANGKAT_DESA_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const lama = await getPerangkatAdmin(villageId, id);
  if (!lama) throw notFound("Perangkat desa tidak ditemukan.");

  await deletePerangkatRow(id);
  if (lama.foto) await hapusMedia(lama.foto);
}
