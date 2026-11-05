import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";
import { notFound, validationError } from "@/lib/errors";

import {
  balasPesanSchema,
  normalisasiNomorSms,
  pesanEmailMasukSchema,
  pesanSmsMasukSchema,
  susunPercakapanSms,
} from "../domain/mailbox-sms";
import { kirimSms } from "../infrastructure/kirim-sms";
import {
  cariMailbox,
  listMailbox,
  listSms,
  tambahMailbox,
  tambahSms,
  tandaiMailboxDibaca,
  tandaiSmsNomorDibaca,
  type BarisMailbox,
  type BarisSms,
} from "../infrastructure/mailbox-sms-repository";
import { kirimNotifikasi } from "./kirim-notifikasi";

export async function ambilKotakMasukAdmin(): Promise<{
  mailbox: BarisMailbox[];
  percakapan: ReturnType<typeof susunPercakapanSms<BarisSms>>;
}> {
  const user = await requirePermission(RESOURCES.notifikasi, "read");
  const villageId = await resolveVillageId(user);
  const [mailbox, sms] = await Promise.all([listMailbox(villageId), listSms(villageId)]);

  return { mailbox, percakapan: susunPercakapanSms(sms) };
}

/** Balas email masuk memakai kanal email yang sudah ada, lalu simpan salinan keluar. */
export async function balasEmailMasuk(input: { id: number; isi: string }) {
  const user = await requirePermission(RESOURCES.notifikasi, "delete");
  const villageId = await resolveVillageId(user);
  const pesan = await cariMailbox(villageId, input.id);
  if (!pesan) throw notFound("Pesan tidak ditemukan.");

  const parsed = balasPesanSchema.safeParse({ isi: input.isi });
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "Balasan tidak valid.");
  }

  const hasil = await kirimNotifikasi({
    villageId,
    jenis: "mailbox.balas",
    kanal: "email",
    target: pesan.alamat,
    subjek: pesan.subjek ? `Re: ${pesan.subjek}` : "Balasan Desa",
    pesan: parsed.data.isi,
  });

  await tambahMailbox({
    villageId,
    arah: "keluar",
    alamat: pesan.alamat,
    subjek: pesan.subjek ? `Re: ${pesan.subjek}` : "Balasan Desa",
    isi: parsed.data.isi,
  });
  await tandaiMailboxDibaca(villageId, pesan.id);

  return hasil;
}

/** Balas SMS ke nomor percakapan; percakapan masuk ditandai sudah dibaca. */
export async function balasSmsMasuk(input: { nomor: string; isi: string }) {
  const user = await requirePermission(RESOURCES.notifikasi, "delete");
  const villageId = await resolveVillageId(user);
  const nomor = normalisasiNomorSms(input.nomor);
  if (!nomor) throw validationError("Nomor SMS tidak valid.");

  const parsed = balasPesanSchema.safeParse({ isi: input.isi });
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "Balasan tidak valid.");
  }

  const hasil = await kirimSms(nomor, parsed.data.isi);
  await tambahSms({
    villageId,
    arah: "keluar",
    nomor,
    isi: parsed.data.isi,
    status: hasil.sukses ? "terkirim" : hasil.dilewati ? "dilewati" : "gagal",
  });
  await tandaiSmsNomorDibaca(villageId, nomor);

  return hasil;
}

/** Simpan email masuk dari webhook setelah token diverifikasi di route. */
export async function terimaEmailMasuk(villageId: number, payload: unknown): Promise<void> {
  const parsed = pesanEmailMasukSchema.safeParse(payload);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "Payload email tidak valid.");
  }

  await tambahMailbox({
    villageId,
    arah: "masuk",
    alamat: parsed.data.from,
    subjek: parsed.data.subject || null,
    isi: parsed.data.text,
  });
}

/** Simpan SMS masuk dari webhook provider setelah token diverifikasi di route. */
export async function terimaSmsMasuk(villageId: number, payload: unknown): Promise<void> {
  const parsed = pesanSmsMasukSchema.safeParse(payload);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "Payload SMS tidak valid.");
  }

  await tambahSms({
    villageId,
    arah: "masuk",
    nomor: normalisasiNomorSms(parsed.data.from),
    isi: parsed.data.message,
    providerId: parsed.data.id ?? null,
  });
}
