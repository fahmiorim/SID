import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  SURAT_KELUAR_RESOURCE,
  SURAT_MASUK_RESOURCE,
  type SuratKeluarInput,
  type SuratMasukInput,
} from "@/features/surat/domain/surat";
import {
  catatLogAgenda,
  createSuratKeluar,
  createSuratMasuk,
  deleteSuratKeluar,
  deleteSuratMasuk,
  getSuratKeluar,
  getSuratMasuk,
  listDisposisiSuratMasuk,
  listEkspedisiSuratKeluar,
  listLogAgenda,
  listSuratKeluar,
  listSuratMasuk,
  nextAgendaNumberKeluar,
  nextAgendaNumberMasuk,
  tambahDisposisiSuratMasuk,
  tambahEkspedisiSuratKeluar,
  updateSuratKeluar,
  updateSuratMasuk,
} from "@/features/surat/infrastructure/agenda-repository";
import { getKlasifikasi, listKlasifikasi } from "@/features/surat/infrastructure/master-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

async function ensureKlasifikasi(villageId: number, id: number | null): Promise<void> {
  if (id === null) return;
  if (!(await getKlasifikasi(villageId, id))) {
    throw conflict("Klasifikasi surat tidak ditemukan.");
  }
}

// --- Surat masuk -----------------------------------------------------------

export async function listSuratMasukWithMeta(search: string) {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [rows, classifications] = await Promise.all([
    listSuratMasuk(villageId, search),
    listKlasifikasi(villageId),
  ]);

  return { rows, classifications };
}

export async function createSuratMasukData(input: SuratMasukInput): Promise<{ id: number }> {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await ensureKlasifikasi(villageId, input.classificationId);
  const agendaNumber =
    input.agendaNumber > 0 ? input.agendaNumber : await nextAgendaNumberMasuk(villageId);
  const id = await createSuratMasuk(villageId, { ...input, agendaNumber });
  return { id };
}

export async function updateSuratMasukData(id: number, input: SuratMasukInput): Promise<void> {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await getSuratMasuk(villageId, id))) throw notFound("Surat masuk tidak ditemukan.");
  await ensureKlasifikasi(villageId, input.classificationId);
  await updateSuratMasuk(villageId, id, input);
}

export async function deleteSuratMasukData(id: number): Promise<void> {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!(await getSuratMasuk(villageId, id))) throw notFound("Surat masuk tidak ditemukan.");
  await deleteSuratMasuk(villageId, id);
}

// --- Surat keluar ----------------------------------------------------------

export async function listSuratKeluarWithMeta(search: string) {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [rows, classifications] = await Promise.all([
    listSuratKeluar(villageId, search),
    listKlasifikasi(villageId),
  ]);

  return { rows, classifications };
}

export async function createSuratKeluarData(input: SuratKeluarInput): Promise<{ id: number }> {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await ensureKlasifikasi(villageId, input.classificationId);
  const agendaNumber =
    input.agendaNumber > 0 ? input.agendaNumber : await nextAgendaNumberKeluar(villageId);
  const id = await createSuratKeluar(villageId, { ...input, agendaNumber });
  return { id };
}

export async function updateSuratKeluarData(id: number, input: SuratKeluarInput): Promise<void> {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await getSuratKeluar(villageId, id))) throw notFound("Surat keluar tidak ditemukan.");
  await ensureKlasifikasi(villageId, input.classificationId);
  await updateSuratKeluar(villageId, id, input);
}

export async function deleteSuratKeluarData(id: number): Promise<void> {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!(await getSuratKeluar(villageId, id))) throw notFound("Surat keluar tidak ditemukan.");
  await deleteSuratKeluar(villageId, id);
}

export async function listDisposisiSuratMasukData(incomingLetterId: number) {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listDisposisiSuratMasuk(villageId, incomingLetterId);
}

export async function tambahDisposisiSuratMasukData(
  incomingLetterId: number,
  input: {
    toUserId?: string | null;
    toRole?: string | null;
    instruction: string;
    dueDate?: string | null;
    note?: string | null;
  },
) {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const surat = await getSuratMasuk(villageId, incomingLetterId);
  if (!surat) throw notFound("Surat masuk tidak ditemukan.");
  if (!input.instruction?.trim()) throw conflict("Instruksi disposisi wajib diisi.");
  const id = await tambahDisposisiSuratMasuk(villageId, incomingLetterId, {
    ...input,
    instruction: input.instruction.trim(),
    dispatchedBy: user.id,
  });
  await catatLogAgenda(villageId, {
    type: "masuk",
    letterId: incomingLetterId,
    action: "disposisi",
    note: input.instruction.trim().slice(0, 255),
    actorId: user.id,
  });
  return { id };
}

export async function listEkspedisiSuratKeluarData(outgoingLetterId: number) {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listEkspedisiSuratKeluar(villageId, outgoingLetterId);
}

export async function tambahEkspedisiSuratKeluarData(
  outgoingLetterId: number,
  input: {
    sentDate: string;
    recipient?: string | null;
    deliveryMethod?: string | null;
    trackingNo?: string | null;
    note?: string | null;
  },
) {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const surat = await getSuratKeluar(villageId, outgoingLetterId);
  if (!surat) throw notFound("Surat keluar tidak ditemukan.");
  if (!input.sentDate) throw conflict("Tanggal kirim wajib diisi.");
  const id = await tambahEkspedisiSuratKeluar(villageId, outgoingLetterId, input);
  await catatLogAgenda(villageId, {
    type: "keluar",
    letterId: outgoingLetterId,
    action: "ekspedisi",
    note: input.trackingNo || input.recipient || null,
    actorId: user.id,
  });
  return { id };
}

export async function listLogSuratMasukData(incomingLetterId: number) {
  const user = await requirePermission(SURAT_MASUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listLogAgenda(villageId, "masuk", incomingLetterId);
}

export async function listLogSuratKeluarData(outgoingLetterId: number) {
  const user = await requirePermission(SURAT_KELUAR_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listLogAgenda(villageId, "keluar", outgoingLetterId);
}
