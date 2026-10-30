import "server-only";

import { getIdentitas } from "@/features/desa/application/get-identitas";
import { type KontakGrupInput, type KontakInput } from "@/features/kontak/domain/kontak";
import {
  buildGrupKontakCsv,
  buildKontakCsv,
  grupKontakFilename,
  kontakFilename,
  type AnggotaGrupEksporRow,
  type KontakEksporRow,
} from "@/features/kontak/domain/kontak-berkas";
import {
  addAnggotaGrup,
  createKontak,
  createKontakGrup,
  deleteKontak,
  deleteKontakGrup,
  listAnggotaGrupDetail,
  listKontak,
  listKontakGrup,
  removeAnggotaGrup,
  updateKontak,
  updateKontakGrup,
} from "@/features/kontak/infrastructure/kontak-repository";

export async function listKontakUseCase(villageId: number) {
  return listKontak(villageId);
}

export async function createKontakUseCase(villageId: number, input: KontakInput) {
  return createKontak({ ...input, villageId });
}

export async function updateKontakUseCase(villageId: number, input: KontakInput) {
  await updateKontak(input.id!, villageId, input);
}

export async function deleteKontakUseCase(villageId: number, id: number) {
  await deleteKontak(id, villageId);
}

export async function listKontakGrupUseCase(villageId: number) {
  return listKontakGrup(villageId);
}

export async function createKontakGrupUseCase(villageId: number, input: KontakGrupInput) {
  return createKontakGrup({ ...input, villageId });
}

export async function updateKontakGrupUseCase(villageId: number, input: KontakGrupInput) {
  await updateKontakGrup(input.id!, villageId, input);
}

export async function deleteKontakGrupUseCase(villageId: number, id: number) {
  await deleteKontakGrup(id, villageId);
}

export async function listAnggotaGrupUseCase(villageId: number, grupId: number) {
  return listAnggotaGrupDetail(villageId, grupId);
}

export async function addAnggotaGrupUseCase(
  villageId: number,
  grupId: number,
  input: { kontakId: number; peran: string | null },
) {
  await addAnggotaGrup({
    villageId,
    grupId,
    kontakId: input.kontakId,
    peran: input.peran,
  });
}

export async function removeAnggotaGrupUseCase(villageId: number, id: number) {
  await removeAnggotaGrup(id, villageId);
}

/** Ekspor seluruh direktori kontak desa sebagai CSV. */
export async function exportKontakUseCase(
  villageId: number,
): Promise<{ csv: string; filename: string } | null> {
  const [rows, desa] = await Promise.all([listKontak(villageId), getIdentitas()]);
  if (rows.length === 0) return null;

  const data: KontakEksporRow[] = rows.map((row) => ({
    id: row.id,
    nama: row.nama,
    telepon: row.telepon,
    email: row.email,
    telegram: row.telegram,
    hubungWarga: row.hubungWarga,
    keterangan: row.keterangan,
    residentId: null,
  }));

  return {
    csv: buildKontakCsv({ namaDesa: desa?.namaDesa ?? null, rows: data }),
    filename: kontakFilename(desa?.namaDesa ?? null),
  };
}

/** Ekspor anggota sebuah grup kontak sebagai CSV. */
export async function exportGrupKontakUseCase(
  villageId: number,
  grupId: number,
): Promise<{ csv: string; filename: string } | null> {
  const [rows, desa, grup] = await Promise.all([
    listAnggotaGrupDetail(villageId, grupId),
    getIdentitas(),
    listKontakGrup(villageId),
  ]);

  const matched = grup.find((g) => g.id === grupId);
  if (!matched) return null;

  const data: AnggotaGrupEksporRow[] = rows.map((row) => ({
    id: row.id,
    namaKontak: row.nama,
    peran: null,
    keterangan: null,
  }));

  return {
    csv: buildGrupKontakCsv({
      namaDesa: desa?.namaDesa ?? null,
      namaGrup: matched.namaGrup,
      rows: data,
    }),
    filename: grupKontakFilename(matched.namaGrup),
  };
}

/** Konversi baris repository ke bentuk UI (tanpa kolom internal). */
export function toKontakRow(row: {
  id: number;
  nama: string;
  telepon: string | null;
  email: string | null;
  telegram: string | null;
  hubungWarga: string | null;
  keterangan: string | null;
}) {
  return {
    id: row.id,
    nama: row.nama,
    telepon: row.telepon,
    email: row.email,
    telegram: row.telegram,
    hubungWarga: row.hubungWarga,
    keterangan: row.keterangan,
  };
}
