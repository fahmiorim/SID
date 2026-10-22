/**
 * Validasi unggahan media (murni, tanpa I/O) — Fase 1C.4.
 *
 * Aturan aman:
 * - Hanya tipe MIME dalam allowlist (gambar & PDF).
 * - Ukuran dibatasi per kategori.
 * - Ekstensi diturunkan dari MIME, **bukan** dari nama berkas kiriman,
 *   sehingga berkas `gambar.php` yang menyamar sebagai JPEG tetap tersimpan
 *   sebagai `.jpg` dan tidak pernah dieksekusi.
 */

export interface JenisMedia {
  mime: string;
  ekstensi: string;
  maksByte: number;
}

const MB = 1024 * 1024;

/** Allowlist MIME → ekstensi kanonik & batas ukuran. */
export const JENIS_MEDIA: Record<string, JenisMedia> = {
  "image/jpeg": { mime: "image/jpeg", ekstensi: "jpg", maksByte: 5 * MB },
  "image/png": { mime: "image/png", ekstensi: "png", maksByte: 5 * MB },
  "image/webp": { mime: "image/webp", ekstensi: "webp", maksByte: 5 * MB },
  "image/gif": { mime: "image/gif", ekstensi: "gif", maksByte: 5 * MB },
  "image/svg+xml": { mime: "image/svg+xml", ekstensi: "svg", maksByte: 1 * MB },
  "application/pdf": { mime: "application/pdf", ekstensi: "pdf", maksByte: 20 * MB },
};

export type HasilValidasiMedia = { ok: true; jenis: JenisMedia } | { ok: false; pesan: string };

/** Berkas unggahan yang sudah dibaca dari `FormData` (isi, bukan jalur). */
export interface BerkasUnggahan {
  nama: string;
  mime: string | null;
  ukuran: number;
  isi: Uint8Array;
}

/** Validasi MIME + ukuran unggahan. Mengembalikan jenis kanonik bila sah. */
export function validasiMedia(
  mime: string | null | undefined,
  ukuranByte: number,
): HasilValidasiMedia {
  if (!mime) return { ok: false, pesan: "Tipe berkas tidak dikenali." };

  const jenis = JENIS_MEDIA[mime.toLowerCase()];
  if (!jenis) {
    return { ok: false, pesan: `Tipe berkas ${mime} tidak diizinkan.` };
  }

  if (ukuranByte <= 0) return { ok: false, pesan: "Berkas kosong." };
  if (ukuranByte > jenis.maksByte) {
    const maksMb = Math.round(jenis.maksByte / MB);
    return { ok: false, pesan: `Ukuran berkas melebihi ${maksMb} MB.` };
  }

  return { ok: true, jenis };
}

/**
 * Bersihkan nama berkas kiriman menjadi basis slug yang aman.
 *
 * Hasil hanya memuat `[a-z0-9-]`; ekstensi tidak disertakan (ditentukan oleh
 * MIME). Bila tidak ada karakter sah, dipakai `berkas`.
 */
export function namaBerkasAman(namaAsli: string): string {
  const tanpaEkstensi = namaAsli.replace(/\.[^.]+$/, "");
  const bersih = tanpaEkstensi
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return bersih || "berkas";
}
