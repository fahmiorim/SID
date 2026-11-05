import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { requirePermission, requireWarga, requireWargaAktif } from "@/lib/dal";
import { notFound } from "@/lib/errors";

import {
  PESAN_WARGA_RESOURCE,
  pesanWargaSchema,
  susunPercakapan,
  type PendudukPercakapan,
  type PercakapanWargaDTO,
  type PesanWargaDTO,
} from "../domain/pesan-warga";
import {
  createPesanWarga,
  findPendudukPercakapan,
  hitungPesanBelumDibacaWarga,
  listPesanPercakapan,
  listPesanWarga,
  tandaiDibacaOperator,
  tandaiDibacaWarga,
} from "../infrastructure/pesan-warga-repository";

/** Riwayat percakapan milik warga yang login; sekaligus menandai sudah dibaca. */
export async function daftarPesanWargaData(): Promise<PesanWargaDTO[]> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  await tandaiDibacaWarga(villageId, user.residentId);
  return listPesanWarga(villageId, user.residentId);
}

/** Jumlah balasan operator yang belum dibaca warga. */
export async function hitungPesanBelumDibacaWargaData(): Promise<number> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  return hitungPesanBelumDibacaWarga(villageId, user.residentId);
}

/** Warga mengirim pesan baru; `residentId` selalu dari sesi. */
export async function kirimPesanWargaData(input: unknown): Promise<{ id: number }> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const { isi } = pesanWargaSchema.parse(input);

  const id = await createPesanWarga({
    villageId,
    residentId: user.residentId,
    pengirim: "warga",
    isi,
  });

  return { id };
}

/** Daftar percakapan untuk operator desa. */
export async function daftarPercakapanWargaData(): Promise<PercakapanWargaDTO[]> {
  const user = await requirePermission(PESAN_WARGA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return susunPercakapan(await listPesanPercakapan(villageId));
}

export interface PercakapanWargaData {
  penduduk: PendudukPercakapan;
  pesan: PesanWargaDTO[];
}

/** Satu percakapan operator; pesan warga ditandai sudah dibaca. */
export async function getPercakapanWargaData(residentId: number): Promise<PercakapanWargaData> {
  if (!Number.isInteger(residentId) || residentId < 1) {
    throw notFound("Percakapan tidak ditemukan.");
  }

  const user = await requirePermission(PESAN_WARGA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  const penduduk = await findPendudukPercakapan(villageId, residentId);
  if (!penduduk) throw notFound("Percakapan tidak ditemukan.");

  await tandaiDibacaOperator(villageId, residentId);
  return { penduduk, pesan: await listPesanWarga(villageId, residentId) };
}

/** Operator membalas percakapan warga desa yang sama. */
export async function balasPesanWargaData(
  residentId: number,
  input: unknown,
): Promise<{ id: number }> {
  if (!Number.isInteger(residentId) || residentId < 1) {
    throw notFound("Percakapan tidak ditemukan.");
  }

  const user = await requirePermission(PESAN_WARGA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const penduduk = await findPendudukPercakapan(villageId, residentId);
  if (!penduduk) throw notFound("Percakapan tidak ditemukan.");

  const { isi } = pesanWargaSchema.parse(input);
  const id = await createPesanWarga({
    villageId,
    residentId,
    pengirim: "operator",
    isi,
    createdBy: user.id,
  });

  return { id };
}
