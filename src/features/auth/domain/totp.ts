import { createHash, createHmac, randomBytes } from "node:crypto";

/** Panjang kode TOTP. */
export const PANJANG_TOTP = 6;
/** Periode waktu TOTP (detik). Standar RFC 6238 = 30 detik. */
export const PERIODE_TOTP = 30;
/** Masa berlaku kode TOTP (ms) - 2 periode untuk toleransi clock skew. */
export const MASA_BERLAKU_TOTP_MS = PERIODE_TOTP * 2 * 1000;
/** Batas percobaan salah sebelum kode dianggap hangus. */
export const MAKS_PERCOBAAN_TOTP = 5;
/** Panjang secret TOTP (bytes). */
export const PANJANG_SECRET_TOTP_BYTES = 20;
/** Panjang secret TOTP base32 (karakter). 20 bytes = 160 bits = 32 chars base32. */
export const PANJANG_SECRET_TOTP = 32;

/**
 * Decode base32 (RFC 4648) tanpa padding.
 */
export function decodeBase32(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const result: number[] = [];

  for (const char of base32.toUpperCase().replace(/=/g, "")) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      result.push((value >> bits) & 0xff);
    }
  }

  return Buffer.from(result);
}

/**
 * Encode buffer ke base32 (RFC 4648).
 */
export function encodeBase32(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let result = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 0x1f];
  }

  return result;
}

/**
 * Generate secret TOTP (base32, 20 bytes = 160 bit entropy = 32 chars base32).
 */
export function buatSecretTotp(): string {
  const bytes = randomBytes(PANJANG_SECRET_TOTP_BYTES);
  return encodeBase32(bytes);
}

/**
 * Hash kode TOTP untuk penyimpanan (SHA-256 hex).
 */
export function hashKodeTotp(kode: string): string {
  return createHash("sha256").update(kode).digest("hex");
}

/**
 * Generate kode TOTP dari secret dan timestamp (RFC 6238 / RFC 4226).
 */
export function generateTotpCode(secretBase32: string, timestamp: number = Date.now()): string {
  const key = decodeBase32(secretBase32);
  let counter = BigInt(Math.floor(timestamp / 1000 / PERIODE_TOTP));

  // Counter ke 8-byte big-endian
  const counterBytes = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = Number(counter & 0xffn);
    counter >>= 8n;
  }

  // HMAC-SHA1
  const hmac = createHmac("sha1", key).update(counterBytes).digest();

  // Dynamic truncation
  const offset = (hmac[hmac.length - 1] ?? 0) & 0x0f;
  const byte0 = hmac[offset] ?? 0;
  const byte1 = hmac[offset + 1] ?? 0;
  const byte2 = hmac[offset + 2] ?? 0;
  const byte3 = hmac[offset + 3] ?? 0;
  const binary =
    ((byte0 & 0x7f) << 24) | ((byte1 & 0xff) << 16) | ((byte2 & 0xff) << 8) | (byte3 & 0xff);

  const otp = binary % 10 ** PANJANG_TOTP;
  return String(otp).padStart(PANJANG_TOTP, "0");
}

/**
 * Verifikasi kode TOTP dengan toleransi ±1 periode (clock skew).
 */
export function verifikasiTotpCode(
  secretBase32: string,
  input: string,
  timestamp: number = Date.now(),
): boolean {
  const bersih = input.trim();
  if (!new RegExp(`^\\d{${PANJANG_TOTP}}$`).test(bersih)) return false;

  // Cek periode saat ini, -1, +1 untuk toleransi clock skew
  for (let delta = -1; delta <= 1; delta++) {
    const ts = timestamp + delta * PERIODE_TOTP * 1000;
    const kode = generateTotpCode(secretBase32, ts);
    if (kode === bersih) return true;
  }
  return false;
}

export interface KodeTotpAktif {
  kodeHash: string;
  kedaluwarsa: Date;
  percobaan: number;
  terpakaiAt: Date | null;
}

/**
 * Periksa kode TOTP yang sudah disimpan (digunakan untuk verifikasi aktivasi).
 * Mengembalikan pesan kesalahan atau `null` bila sah.
 */
export function periksaKodeTotp(
  kode: KodeTotpAktif,
  masukan: string,
  sekarang: Date = new Date(),
): string | null {
  if (kode.terpakaiAt) return "Kode TOTP sudah dipakai. Generate kode baru.";
  if (kode.kedaluwarsa.getTime() < sekarang.getTime()) {
    return "Kode TOTP sudah kedaluwarsa. Generate kode baru.";
  }
  if (kode.percobaan >= MAKS_PERCOBAAN_TOTP) {
    return "Terlalu banyak percobaan. Generate kode baru.";
  }

  const bersih = masukan.trim();
  if (!new RegExp(`^\\d{${PANJANG_TOTP}}$`).test(bersih)) {
    return `Kode TOTP harus ${PANJANG_TOTP} digit angka.`;
  }
  if (hashKodeTotp(bersih) !== kode.kodeHash) return "Kode TOTP salah.";

  return null;
}
