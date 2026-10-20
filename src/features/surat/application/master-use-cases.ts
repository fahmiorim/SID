import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  JENIS_SURAT_RESOURCE,
  KLASIFIKASI_SURAT_RESOURCE,
  type JenisSuratInput,
  type KlasifikasiSuratInput,
} from "@/features/surat/domain/surat";
import {
  countJenisByKlasifikasi,
  countSuratByJenis,
  createJenisSurat,
  createKlasifikasi,
  deleteJenisSurat,
  deleteKlasifikasi,
  getJenisSurat,
  getKlasifikasi,
  jenisSuratExists,
  klasifikasiExists,
  listJenisSurat,
  listKlasifikasi,
  updateJenisSurat,
  updateKlasifikasi,
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
}

export async function createJenisSuratData(input: JenisSuratInput): Promise<{ id: number }> {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await ensureJenisInput(villageId, input, null);

  const id = await createJenisSurat(villageId, { ...input, code: normalizeCode(input.code) });
  return { id };
}

export async function updateJenisSuratData(id: number, input: JenisSuratInput): Promise<void> {
  const user = await requirePermission(JENIS_SURAT_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await requireJenisSurat(villageId, id);
  await ensureJenisInput(villageId, input, id);

  await updateJenisSurat(villageId, id, { ...input, code: normalizeCode(input.code) });
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
