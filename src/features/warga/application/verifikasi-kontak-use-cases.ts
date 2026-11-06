import "server-only";

import { createHash, randomInt } from "node:crypto";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { kirimNotifikasi } from "@/features/notifikasi/application/kirim-notifikasi";
import { requireWarga, requireWargaAktif } from "@/lib/dal";
import { validationError } from "@/lib/errors";

import {
  kodeVerifikasiSchema,
  MASA_BERLAKU_KODE_MS,
  PANJANG_KODE,
  verifikasiKontakSchema,
} from "../domain/verifikasi-kontak";
import {
  findKodeAktif,
  getKontakTerverifikasi,
  simpanKodeVerifikasi,
  tandaiKontakTerverifikasi,
} from "../infrastructure/verifikasi-kontak-repository";

function hashKode(kode: string): string {
  return createHash("sha256").update(kode).digest("hex");
}

/** Minta kode verifikasi HP; kode dikirim lewat WhatsApp. */
export async function mintaVerifikasiKontakData(target: unknown): Promise<{
  terkirim: boolean;
  pesan: string;
}> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const parsed = verifikasiKontakSchema.parse({ target });

  const kode = String(randomInt(0, 10 ** PANJANG_KODE)).padStart(PANJANG_KODE, "0");
  await simpanKodeVerifikasi({
    villageId,
    residentId: user.residentId,
    target: parsed.target.target,
    kanal: parsed.target.kanal,
    kodeHash: hashKode(kode),
    kedaluwarsa: new Date(Date.now() + MASA_BERLAKU_KODE_MS),
  });

  const hasil = await kirimNotifikasi({
    villageId,
    residentId: user.residentId,
    jenis: "verifikasi-kontak.kode",
    kanal: parsed.target.kanal,
    target: parsed.target.target,
    subjek: parsed.target.kanal === "email" ? "Kode verifikasi email" : "Kode verifikasi nomor HP",
    pesan: `Kode verifikasi Layanan Mandiri Anda: ${kode}. Berlaku 10 menit. Jangan bagikan kode ini.`,
  });

  if (hasil.dilewati) {
    return {
      terkirim: false,
      pesan:
        parsed.target.kanal === "email"
          ? "Provider email belum dikonfigurasi sehingga kode tidak terkirim. Hubungi operator desa untuk verifikasi manual."
          : "Provider WhatsApp belum dikonfigurasi sehingga kode tidak terkirim. Hubungi operator desa untuk verifikasi manual.",
    };
  }

  return {
    terkirim: hasil.sukses,
    pesan: hasil.sukses
      ? parsed.target.kanal === "email"
        ? "Kode verifikasi telah dikirim ke email Anda."
        : "Kode verifikasi telah dikirim ke WhatsApp Anda."
      : "Gagal mengirim kode verifikasi. Coba lagi beberapa saat.",
  };
}

/** Verifikasi kode 6 digit yang dikirim ke HP warga. */
export async function verifikasiKontakWargaData(kode: unknown): Promise<void> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const parsed = kodeVerifikasiSchema.parse(kode);
  const aktif = await findKodeAktif(villageId, user.residentId);

  if (!aktif) {
    throw validationError("Tidak ada kode verifikasi aktif. Minta kode baru terlebih dahulu.");
  }
  if (aktif.kedaluwarsa.getTime() < Date.now()) {
    throw validationError("Kode verifikasi sudah kedaluwarsa. Minta kode baru.");
  }
  if (aktif.kodeHash !== hashKode(parsed)) {
    throw validationError("Kode verifikasi salah.");
  }

  await tandaiKontakTerverifikasi(aktif.id);
}

/** Status verifikasi kontak warga saat ini. */
export async function statusVerifikasiKontakData(): Promise<{
  target: string | null;
  terverifikasi: boolean;
  kanal: "whatsapp" | "email" | null;
}> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  const terverifikasi = await getKontakTerverifikasi(villageId, user.residentId);
  return {
    target: terverifikasi?.target ?? null,
    terverifikasi: Boolean(terverifikasi),
    kanal: terverifikasi?.kanal === "email" ? "email" : terverifikasi ? "whatsapp" : null,
  };
}
