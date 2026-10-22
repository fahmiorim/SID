import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  parseIsianFields,
  parseSyaratIds,
  serializeIsianFields,
  serializeSyaratIds,
  validateIsianFields,
  type SyaratSuratInput,
} from "@/features/surat/domain/isian";
import {
  JENIS_SURAT_RESOURCE,
  KLASIFIKASI_SURAT_RESOURCE,
  SYARAT_SURAT_RESOURCE,
  type JenisSuratInput,
  type KlasifikasiSuratInput,
} from "@/features/surat/domain/surat";
import {
  countJenisByKlasifikasi,
  countJenisBySyarat,
  countSuratByJenis,
  createJenisSurat,
  createKlasifikasi,
  createSyaratSurat,
  deleteJenisSurat,
  deleteKlasifikasi,
  deleteSyaratSurat,
  getJenisSurat,
  getKlasifikasi,
  getSyaratSurat,
  jenisSuratExists,
  klasifikasiExists,
  listJenisSurat,
  listKlasifikasi,
  listSyaratSurat,
  syaratSuratNameExists,
  updateJenisSurat,
  updateKlasifikasi,
  updateSyaratSurat,
} from "@/features/surat/infrastructure/master-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function listKlasifikasiSurat() {
  const user = await requirePermission(KLASIFIKASI_SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listKlasifikasi(villageId);
}

export async function createKlasifikasiSuratData(
  input: KlasifikasiSuratInput,
): Promise<{ id: number }> {
  const user = await requirePermission(KLASIFIKASI_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const code = normalizeCode(input.code);

  if (await klasifikasiExists(villageId, code, null)) {
    throw conflict("Kode klasifikasi sudah digunakan.");
  }

  const id = await createKlasifikasi(villageId, { code, name: input.name });
  return { id };
}

export async function updateKlasifikasiSuratData(
  id: number,
  input: KlasifikasiSuratInput,
): Promise<void> {
  const user = await requirePermission(KLASIFIKASI_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await getKlasifikasi(villageId, id))) throw notFound("Klasifikasi tidak ditemukan.");

  const code = normalizeCode(input.code);
  if (await klasifikasiExists(villageId, code, id)) {
    throw conflict("Kode klasifikasi sudah digunakan.");
  }

  await updateKlasifikasi(villageId, id, { code, name: input.name });
}

export async function deleteKlasifikasiSuratData(id: number): Promise<void> {
  const user = await requirePermission(KLASIFIKASI_SURAT_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!(await getKlasifikasi(villageId, id))) throw notFound("Klasifikasi tidak ditemukan.");

  if ((await countJenisByKlasifikasi(villageId, id)) > 0) {
    throw conflict("Klasifikasi masih dipakai oleh jenis surat dan tidak dapat dihapus.");
  }

  await deleteKlasifikasi(villageId, id);
}

export async function listJenisSuratWithMeta() {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [rows, classifications] = await Promise.all([
    listJenisSurat(villageId),
    listKlasifikasi(villageId),
  ]);

  return { rows, classifications };
}

/** Helper internal: pastikan jenis surat ada pada desa tersebut. */
async function requireJenisSurat(villageId: number, id: number) {
  const jenis = await getJenisSurat(villageId, id);
  if (!jenis) throw notFound("Jenis surat tidak ditemukan.");
  return jenis;
}

async function ensureJenisInput(
  villageId: number,
  input: JenisSuratInput,
  excludeId: number | null,
): Promise<void> {
  const code = normalizeCode(input.code);

  if (await jenisSuratExists(villageId, code, excludeId)) {
    throw conflict("Kode jenis surat sudah digunakan.");
  }

  if (input.classificationId !== null) {
    const klasifikasi = await getKlasifikasi(villageId, input.classificationId);
    if (!klasifikasi) throw conflict("Klasifikasi surat tidak ditemukan.");
  }

  const fields = parseIsianFields(input.formIsian);
  const fieldError = validateIsianFields(fields);
  if (fieldError) throw conflict(fieldError);

  const syaratIds = parseSyaratIds(input.syaratSurat);
  for (const syaratId of syaratIds) {
    const syarat = await getSyaratSurat(villageId, syaratId);
    if (!syarat) throw conflict("Syarat surat yang dipilih tidak ditemukan.");
  }
}

export async function createJenisSuratData(input: JenisSuratInput): Promise<{ id: number }> {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await ensureJenisInput(villageId, input, null);

  const id = await createJenisSurat(villageId, {
    ...input,
    code: normalizeCode(input.code),
    formIsian: serializeIsianFields(parseIsianFields(input.formIsian)),
    syaratSurat: serializeSyaratIds(parseSyaratIds(input.syaratSurat)),
  });
  return { id };
}

export async function updateJenisSuratData(id: number, input: JenisSuratInput): Promise<void> {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await requireJenisSurat(villageId, id);
  await ensureJenisInput(villageId, input, id);

  await updateJenisSurat(villageId, id, {
    ...input,
    code: normalizeCode(input.code),
    formIsian: serializeIsianFields(parseIsianFields(input.formIsian)),
    syaratSurat: serializeSyaratIds(parseSyaratIds(input.syaratSurat)),
  });
}

export async function deleteJenisSuratData(id: number): Promise<void> {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  await requireJenisSurat(villageId, id);

  if ((await countSuratByJenis(villageId, id)) > 0) {
    throw conflict("Jenis surat sudah dipakai pada arsip surat dan tidak dapat dihapus.");
  }

  await deleteJenisSurat(villageId, id);
}

// --- Syarat surat ---------------------------------------------------------

export async function listSyaratSuratWithMeta() {
  const user = await requirePermission(SYARAT_SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listSyaratSurat(villageId);
}

/**
 * Daftar syarat surat untuk dipilih pada jenis surat.
 *
 * Syarat dipakai sebagai bagian dari formulir jenis surat, jadi akses mengikuti
 * modul jenis surat (bukan modul syarat surat) agar operator yang mengelola
 * jenis surat tetap bisa memilih syarat.
 */
export async function listSyaratSuratOptions() {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listSyaratSurat(villageId);
}

export async function createSyaratSuratData(input: SyaratSuratInput): Promise<{ id: number }> {
  const user = await requirePermission(SYARAT_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const name = input.name.trim();
  if (await syaratSuratNameExists(villageId, name, null)) {
    throw conflict("Nama syarat surat sudah digunakan.");
  }

  const id = await createSyaratSurat(villageId, {
    name,
    description: input.description.trim() === "" ? null : input.description.trim(),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  });
  return { id };
}

export async function updateSyaratSuratData(id: number, input: SyaratSuratInput): Promise<void> {
  const user = await requirePermission(SYARAT_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await getSyaratSurat(villageId, id))) throw notFound("Syarat surat tidak ditemukan.");

  const name = input.name.trim();
  if (await syaratSuratNameExists(villageId, name, id)) {
    throw conflict("Nama syarat surat sudah digunakan.");
  }

  await updateSyaratSurat(villageId, id, {
    name,
    description: input.description.trim() === "" ? null : input.description.trim(),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  });
}

export async function deleteSyaratSuratData(id: number): Promise<void> {
  const user = await requirePermission(SYARAT_SURAT_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!(await getSyaratSurat(villageId, id))) throw notFound("Syarat surat tidak ditemukan.");

  if ((await countJenisBySyarat(villageId, id)) > 0) {
    throw conflict("Syarat surat masih dipakai jenis surat dan tidak dapat dihapus.");
  }

  await deleteSyaratSurat(villageId, id);
}
