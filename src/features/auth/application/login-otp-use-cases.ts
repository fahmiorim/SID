import "server-only";

import { kirimNotifikasi } from "@/features/notifikasi/application/kirim-notifikasi";
import { batasiPermintaan } from "@/features/rate-limit/application/rate-limit";
import { validationError } from "@/lib/errors";

import { buatKodeOtp, hashKodeOtp, MASA_BERLAKU_OTP_MS, periksaKodeOtp } from "../domain/login-otp";
import {
  getLoginOtpContext,
  getOtpLoginAktif,
  getOtpLoginTarget,
} from "../infrastructure/auth-repository";
import {
  findKodeLoginAktif,
  simpanKodeLogin,
  tambahPercobaanLogin,
  tandaiKodeLoginTerpakai,
} from "../infrastructure/login-otp-repository";

/** Status OTP login akun sesi; `userId` harus berasal dari sesi, bukan input klien. */
export async function getStatusOtpLoginAktif(userId: string): Promise<boolean> {
  return getOtpLoginAktif(userId);
}

const PESAN_GENERIK =
  "Jika akun ini memerlukan kode OTP, kode telah dikirim ke nomor WhatsApp atau email terdaftar.";

/**
 * Kirim kode OTP login bila akun mengaktifkannya.
 *
 * Selalu membalas pesan generik agar keberadaan akun tidak bocor. Permintaan
 * dibatasi 3 kali per 5 menit per akun.
 */
export async function mintaKodeLogin(
  username: string,
): Promise<{ pesan: string; terkirim: boolean }> {
  const context = await getLoginOtpContext(username);

  if (!context || !context.active || !context.otpLoginAktif) {
    return { pesan: PESAN_GENERIK, terkirim: false };
  }

  const batas = await batasiPermintaan(`login-otp:${context.id}`, {
    batas: 3,
    jendelaMs: 5 * 60 * 1000,
  });
  if (batas.dibatasi) {
    return {
      pesan: "Terlalu banyak permintaan kode OTP. Coba lagi beberapa menit.",
      terkirim: false,
    };
  }

  if (context.villageId === null) {
    return { pesan: PESAN_GENERIK, terkirim: false };
  }

  const target = context.phone ?? context.email;
  const kanal = context.phone ? "whatsapp" : "email";

  const kode = buatKodeOtp();
  await simpanKodeLogin({
    userId: context.id,
    kanal,
    target,
    kodeHash: hashKodeOtp(kode),
    kedaluwarsa: new Date(Date.now() + MASA_BERLAKU_OTP_MS),
  });

  await kirimNotifikasi({
    villageId: context.villageId,
    residentId: context.residentId,
    jenis: "auth.login.otp",
    kanal,
    target,
    subjek: "Kode OTP masuk",
    pesan: `Kode OTP masuk Anda: ${kode}. Berlaku 10 menit. Jangan bagikan kode ini.`,
  });

  return { pesan: PESAN_GENERIK, terkirim: true };
}

/** Verifikasi kode OTP login; melempar kesalahan aman bila tidak sah. */
export async function verifikasiKodeLogin(userId: string, kode: string): Promise<void> {
  const aktif = await findKodeLoginAktif(userId);

  if (!aktif) {
    throw validationError("Tidak ada kode OTP aktif. Masuk tanpa kode untuk meminta kode baru.");
  }

  const kesalahan = periksaKodeOtp(aktif, kode);
  if (kesalahan) {
    if (kesalahan === "Kode OTP salah.") await tambahPercobaanLogin(aktif.id);
    throw validationError(kesalahan);
  }

  await tandaiKodeLoginTerpakai(aktif.id);
}

/** Apakah akun ini bisa memakai OTP (punya nomor HP atau email). */
export async function siapkanOtpLogin(
  userId: string,
): Promise<{ bisa: boolean; target: string | null }> {
  const row = await getOtpLoginTarget(userId);
  if (!row) return { bisa: false, target: null };

  const target = row.phone ?? row.email;
  return { bisa: Boolean(target), target };
}
