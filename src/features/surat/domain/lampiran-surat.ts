/**
 * Lampiran disposisi & ekspedisi — validasi, parsing, cleanup.
 *
 * Aturan:
 * - Maksimal 5 file per disposisi/ekspedisi.
 * - MIME: image/jpeg, image/png, image/webp, application/pdf.
 * - Ukuran: maksimal 10 MB per file.
 */

import { z } from "zod";

// --- Pengaturan lampiran dinamis ------------------------------------------

import {
  validasiJumlahFile,
  validasiMediaDenganPengaturan,
  type MediaSettingsEfektif,
} from "@/features/kebijakan-berkas/domain/pengaturan-berkas";

const MB = 1024 * 1024;

/** MIME diizinkan untuk lampiran surat (disposisi/ekspedisi). */
export const MIME_LAMPIRAN_SURAT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

/** Maksimal file per lampiran. */
export const MAKS_LAMPIRAN = 5;

/** Maksimal ukuran per file (10 MB). */
export const MAKS_UKURAN_LAMPIRAN = 10 * MB;

/** Satu item lampiran (disimpan sebagai JSON array di kolom `lampiran`). */
export const lampiranItemSchema = z.object({
  /** Jalur relatif media (mis. `123/surat/disposisi/file.jpg`). */
  path: z.string().min(1).max(500),
  /** Nama asli file yang diunggah. */
  name: z.string().min(1).max(255),
  /** MIME type kanonik. */
  mime: z.string().min(1).max(100),
  /** Ukuran dalam byte. */
  size: z.number().int().positive(),
});

export type LampiranItem = z.infer<typeof lampiranItemSchema>;

/**
 * Skema validasi kolom `lampiran` (JSON text di DB).
 *
 * Kolom menyimpan JSON array; nilai rusak/lama menghasilkan daftar kosong.
 */
export function parseLampiran(raw: string | null | undefined): LampiranItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const result = z.array(lampiranItemSchema).safeParse(parsed);
    if (!result.success) return [];
    return result.data;
  } catch {
    return [];
  }
}

/** Serialisasi array lampiran menjadi JSON text (atau null). */
export function serializeLampiran(items: LampiranItem[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(items);
}

/** Validasi MIME lampiran. */
export function validasiMimeLampiran(mime: string | null | undefined): boolean {
  return MIME_LAMPIRAN_SURAT.includes(mime as (typeof MIME_LAMPIRAN_SURAT)[number]);
}

/**
 * Validasi berkas unggahan lampiran: cek MIME + ukuran.
 *
 * @returns pesan error, atau `undefined` bila valid.
 */
export function validasiUnggahanLampiran(
  mime: string | null | undefined,
  ukuran: number,
): string | undefined {
  if (!validasiMimeLampiran(mime)) {
    return "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.";
  }
  if (ukuran > MAKS_UKURAN_LAMPIRAN) {
    return `Ukuran file maksimal 10 MB.`;
  }
  if (ukuran === 0) return "File kosong.";
  return undefined;
}

// --- Ekspedisi terpadu --------------------------------------------------

/** Modul sumber ekspedisi. */
export const EKSPEDISI_SOURCES = [
  "surat_masuk",
  "surat_keluar",
  "surat_dinas",
  "pengaduan",
  "bimtek",
] as const;

export type EkspedisiSource = (typeof EKSPEDISI_SOURCES)[number];

/**
 * Verifikasi apakah modul sumber valid untuk ekspedisi terpadu.
 */
export function isValidEkspedisiSource(modul: string): modul is EkspedisiSource {
  return EKSPEDISI_SOURCES.includes(modul as EkspedisiSource);
}

// --- Audit trail --------------------------------------------------------

/** Nama action di audit trail. */
export type AuditAction = "create" | "update" | "delete" | "attachment_add" | "attachment_remove";

/**
 * Encode nilai untuk audit trail (JSON-encoded string atau null).
 */
export function encodeAuditValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return JSON.stringify(value);
}

/**
 * Decode nilai dari audit trail.
 */
export function decodeAuditValue(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Validasi berkas unggahan lampiran menggunakan pengaturan dari DB. */
export function validasiUnggahanLampiranDenganPengaturan(
  pengaturan: MediaSettingsEfektif,
  mime: string | null | undefined,
  ukuran: number,
): string | undefined {
  return validasiMediaDenganPengaturan(pengaturan, mime, ukuran);
}

/** Validasi jumlah lampiran menggunakan pengaturan dari DB. */
export function validasiJumlahLampiranDenganPengaturan(
  pengaturan: MediaSettingsEfektif,
  jumlah: number,
): string | undefined {
  return validasiJumlahFile(pengaturan, jumlah);
}
