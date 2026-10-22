import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import type { BeritaRingkas } from "@/features/publik/infrastructure/content-repository";

/**
 * Helper tampilan bersama untuk tema (Fase 1D).
 *
 * Semuanya murni (tanpa I/O) dan hanya mengubah data domain menjadi potongan
 * siap-render, sehingga logika tanggal/ringkasan tidak diduplikasi antar tema.
 */

export { formatTanggal, ringkasTeks, urlMedia };

/** Nama lengkap perangkat desa dari komponen gelar. */
export function namaLengkap(
  nama: string,
  gelarDepan: string | null,
  gelarBelakang: string | null,
): string {
  return [gelarDepan?.trim(), nama, gelarBelakang?.trim()].filter(Boolean).join(" ");
}

/** Tanggal tayang sebuah berita (terbit, atau saat dibuat). */
export function tanggalBerita(item: BeritaRingkas): string {
  return formatTanggal(item.terbitPada ?? item.createdAt);
}

/** Potong misi tersimpan (satu per baris) menjadi daftar. */
export function misiKeDaftar(misi: string | null | undefined): string[] {
  if (!misi) return [];
  return misi
    .split(/\r?\n/)
    .map((baris) => baris.replace(/^[-•*\d.\s]+/, "").trim())
    .filter((baris) => baris.length > 0);
}
