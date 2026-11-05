import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { totp } from "@/db/schema/auth";
import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requireUser } from "@/lib/dal";
import { validationError } from "@/lib/errors";

import {
  buatSecretTotp,
  generateTotpCode,
  hashKodeTotp,
  MASA_BERLAKU_TOTP_MS,
  PANJANG_TOTP,
  periksaKodeTotp,
  verifikasiTotpCode,
} from "../domain/totp";
import {
  findKodeTotpAktif,
  getTotpSecret,
  setTotpSecret,
  simpanKodeTotp,
  tambahPercobaanTotp,
  tandaiKodeTotpTerpakai,
} from "../infrastructure/totp-repository";

/**
 * Generate secret TOTP baru untuk aktivasi (belum disimpan ke DB).
 * Dipakai untuk menampilkan QR code / secret ke pengguna.
 */
export async function generateTotpSetup(): Promise<{
  secret: string;
  uri: string;
}> {
  const user = await requireUser();
  const secret = buatSecretTotp();
  const label = `SID Desa (${user.username ?? user.email})`;
  const issuer = "SID Desa";
  const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${PANJANG_TOTP}&period=30`;

  return { secret, uri };
}

/**
 * Verifikasi kode TOTP saat aktivasi; jika valid, simpan secret ke users.totp_secret.
 */
export async function verifikasiDanAktifkanTotp(kode: string): Promise<void> {
  const user = await requireUser();

  // Cek apakah sudah ada secret TOTP
  const existingSecret = await getTotpSecret(user.id);
  if (existingSecret) {
    // Sudah punya TOTP aktif, gunakan secret yang ada untuk verifikasi
    if (!verifikasiTotpCode(existingSecret, kode)) {
      throw validationError("Kode TOTP tidak valid.");
    }
    return; // Sudah aktif, tidak perlu simpan lagi
  }

  // Belum punya TOTP - generate secret baru dari server? Tidak, kita butuh secret yang baru di-generate
  // Di sini seharusnya secret sudah di-generate via generateTotpSetup() dan dikirim ke UI
  // Untuk verifikasi aktivasi, kita butuh secret yang tadi di-generate
  // Karena secret belum disimpan, kita tidak bisa verifikasi di sini
  // Flow: generateTotpSetup() -> UI tampilkan QR -> user scan -> user input kode -> verifikasiDanAktifkanTotp(kode, secret)
  throw validationError("Secret TOTP belum disiapkan. Generate setup terlebih dahulu.");
}

/**
 * Verifikasi kode TOTP dengan secret yang diberikan (untuk aktivasi pertama kali).
 */
export async function verifikasiTotpAktivasi(kode: string, secret: string): Promise<void> {
  const user = await requireUser();

  if (!verifikasiTotpCode(secret, kode)) {
    throw validationError("Kode TOTP tidak valid.");
  }

  // Simpan secret ke database
  await setTotpSecret(user.id, secret);

  // Audit
  await recordAuditEvent({
    villageId: user.villageId ?? 0,
    actorId: user.id,
    event: AUDIT_EVENTS.totpAktifkan ?? "totp.aktifkan",
    resource: RESOURCES.pengguna,
    details: { userId: user.id },
  });
}

/**
 * Nonaktifkan TOTP untuk pengguna.
 */
export async function nonaktifkanTotp(): Promise<void> {
  const user = await requireUser();

  await setTotpSecret(user.id, null);

  // Hapus kode TOTP yang tersisa
  await db.delete(totp).where(eq(totp.userId, user.id));

  // Audit
  await recordAuditEvent({
    villageId: user.villageId ?? 0,
    actorId: user.id,
    event: AUDIT_EVENTS.totpNonaktifkan,
    resource: RESOURCES.pengguna,
    details: { userId: user.id },
  });
}

/**
 * Generate kode TOTP untuk verifikasi login (challenge-response).
 * Disimpan ke tabel `totp` dengan masa berlaku singkat.
 */
export async function mintaKodeTotpLogin(): Promise<{ pesan: string; terkirim: boolean }> {
  const user = await requireUser();

  // Cek apakah TOTP aktif
  const secret = await getTotpSecret(user.id);
  if (!secret) {
    return { pesan: "TOTP tidak aktif untuk akun ini.", terkirim: false };
  }

  // Generate kode TOTP dan simpan ke DB
  const kode = generateTotpCode(secret);
  const kodeHash = hashKodeTotp(kode);
  const kedaluwarsa = new Date(Date.now() + MASA_BERLAKU_TOTP_MS);

  await simpanKodeTotp({ userId: user.id, kodeHash, kedaluwarsa });

  // Di sini seharusnya dikirim via email/WhatsApp, tapi TOTP biasanya ditampilkan di app authenticator
  // Kita return kode untuk testing; di production sebaiknya dikirim via channel aman
  return {
    pesan: `Kode TOTP Anda: ${kode} (masukkan dalam aplikasi authenticator untuk verifikasi)`,
    terkirim: true,
  };
}

/**
 * Verifikasi kode TOTP saat login.
 */
export async function verifikasiKodeTotpLogin(kode: string): Promise<void> {
  const user = await requireUser();

  const secret = await getTotpSecret(user.id);
  if (!secret) {
    throw validationError("TOTP tidak aktif untuk akun ini.");
  }

  // Verifikasi langsung via algoritma (lebih cepat, tidak butuh DB)
  if (!verifikasiTotpCode(secret, kode)) {
    throw validationError("Kode TOTP tidak valid.");
  }

  // Optional: catat percobaan ke DB untuk audit
  const kodeAktif = await findKodeTotpAktif(user.id);
  if (kodeAktif) {
    await tambahPercobaanTotp(kodeAktif.id);
    if (periksaKodeTotp(kodeAktif, kode) !== null) {
      throw validationError("Kode TOTP tidak valid.");
    }
    await tandaiKodeTotpTerpakai(kodeAktif.id);
  }
}

/**
 * Cek apakah pengguna punya TOTP aktif.
 */
export async function cekTotpAktif(): Promise<boolean> {
  const user = await requireUser();
  const secret = await getTotpSecret(user.id);
  return !!secret;
}
