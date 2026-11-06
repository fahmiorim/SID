import { isThemeSlot, THEME_SLOTS, type ThemeManifest } from "./theme";

/**
 * Pemindaian manifest tema terpasang (OS-WEB-017).
 *
 * Tema tetap merupakan kode build-time; fungsi ini **tidak** memuat kode atau
 * mengunggah tema saat runtime. Ia hanya memvalidasi manifest yang sudah
 * terdaftar di registry agar tema rusak/tidak lengkap tidak bisa diaktifkan.
 */

const POLA_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POLA_VERSI = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

export interface HasilPindaiTema {
  manifest: ThemeManifest;
  valid: boolean;
  masalah: string[];
}

/** Periksa satu manifest; daftar `masalah` kosong berarti valid. */
export function pindaiManifestTema(manifest: ThemeManifest): HasilPindaiTema {
  const masalah: string[] = [];

  if (!POLA_SLUG.test(manifest.slug)) {
    masalah.push("Slug tema hanya boleh huruf kecil, angka, dan tanda hubung.");
  }
  if (manifest.nama.trim() === "") {
    masalah.push("Nama tema wajib diisi.");
  }
  if (!POLA_VERSI.test(manifest.versi)) {
    masalah.push("Versi tema harus mengikuti format semver, mis. 1.2.0.");
  }

  const slot = Array.isArray(manifest.slot) ? manifest.slot : [];
  const tidakDikenal = [...new Set(slot.filter((item) => !isThemeSlot(item)))];
  if (tidakDikenal.length > 0) {
    masalah.push(`Slot tidak dikenal: ${tidakDikenal.join(", ")}.`);
  }

  const duplikat = [...new Set(slot.filter((item, index) => slot.indexOf(item) !== index))];
  if (duplikat.length > 0) {
    masalah.push(`Slot ganda: ${duplikat.join(", ")}.`);
  }

  const hilang = THEME_SLOTS.filter((item) => !slot.includes(item));
  if (hilang.length > 0) {
    masalah.push(`Slot belum tersedia: ${hilang.join(", ")}.`);
  }

  return { manifest, valid: masalah.length === 0, masalah };
}

/** Ringkasan singkat untuk pesan UI/aksi. */
export function ringkasMasalahTema(hasil: HasilPindaiTema): string {
  return hasil.masalah.length === 0 ? "Manifest valid." : hasil.masalah.join(" ");
}
