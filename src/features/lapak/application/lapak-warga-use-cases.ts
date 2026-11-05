import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { requireWarga, requireWargaAktif } from "@/lib/dal";
import { notFound } from "@/lib/errors";

import { lapakWargaSchema, type LapakDTO } from "../domain/lapak";
import {
  createLapak,
  deleteLapakWarga,
  findLapakWarga,
  listLapakWarga,
  namaPenduduk,
  updateLapakWarga,
} from "../infrastructure/lapak-repository";

function keDTO(row: {
  id: number;
  villageId: number;
  residentId: number | null;
  nama: string;
  pemilik: string | null;
  kategori: string | null;
  alamat: string | null;
  keterangan: string | null;
}): LapakDTO {
  return row;
}

/** Lapak milik warga yang sedang login. */
export async function daftarLapakWargaData(): Promise<LapakDTO[]> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  const rows = await listLapakWarga(villageId, user.residentId);
  return rows.map(keDTO);
}

/** Tambah lapak; `residentId` selalu dari sesi. */
export async function tambahLapakWargaData(input: unknown): Promise<{ id: number }> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const parsed = lapakWargaSchema.parse(input);
  const nama = (await namaPenduduk(villageId, user.residentId)) ?? "Warga";

  const id = await createLapak({
    villageId,
    residentId: user.residentId,
    nama: parsed.nama,
    pemilik: nama,
    kategori: parsed.kategori || null,
    alamat: parsed.alamat || null,
    keterangan: parsed.keterangan || null,
  });

  return { id };
}

/** Ubah lapak milik sendiri. */
export async function ubahLapakWargaData(id: number, input: unknown): Promise<void> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  if (!(await findLapakWarga(villageId, user.residentId, id))) {
    throw notFound("Lapak tidak ditemukan.");
  }

  const parsed = lapakWargaSchema.parse(input);
  await updateLapakWarga(id, villageId, user.residentId, {
    nama: parsed.nama,
    kategori: parsed.kategori || null,
    alamat: parsed.alamat || null,
    keterangan: parsed.keterangan || null,
  });
}

/** Hapus lapak milik sendiri. */
export async function hapusLapakWargaData(id: number): Promise<void> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  if (!(await findLapakWarga(villageId, user.residentId, id))) {
    throw notFound("Lapak tidak ditemukan.");
  }
  await deleteLapakWarga(id, villageId, user.residentId);
}
