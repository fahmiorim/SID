import type { ThemeManifest } from "@/features/publik/domain/theme";

/**
 * Katalog manifest tema (Fase 1D).
 *
 * Berisi **data murni** tanpa komponen React, sehingga dapat diimpor dari mana
 * pun — termasuk skrip seed yang berjalan di luar runtime Next.js dan tidak
 * boleh menyentuh modul `server-only`. Paket komponennya sendiri didaftarkan
 * terpisah di `src/themes/registry.ts`.
 */

export const ESENSI_MANIFEST: ThemeManifest = {
  slug: "esensi",
  nama: "Esensi",
  versi: "1.0.0",
  deskripsi:
    "Tema bersih dengan banyak ruang putih, header terang, dan penekanan pada keterbacaan. Cocok untuk desa yang ingin tampil rapi dan informatif.",
  warnaPratinjau: "#1a7f4b",
  slot: [
    "layout",
    "home",
    "profil",
    "perangkat",
    "berita",
    "berita-detail",
    "galeri",
    "galeri-detail",
    "dokumen",
    "statistik",
    "apbdes",
    "kelompok",
    "inventaris",
    "surat",
    "status-desa",
    "survei",
    "triwulan",
    "bantuan",
    "kontak",
    "sinergi",
    "layanan-mandiri",
    "halaman",
  ],
  tataLetak: "polos",
};

export const NATRA_MANIFEST: ThemeManifest = {
  slug: "natra",
  nama: "Natra",
  versi: "1.0.0",
  deskripsi:
    "Tema modern dengan blok warna tebal, kartu berbayang, dan header berwarna penuh. Cocok untuk desa dengan banyak konten visual.",
  warnaPratinjau: "#e64946",
  slot: [
    "layout",
    "home",
    "profil",
    "perangkat",
    "berita",
    "berita-detail",
    "galeri",
    "galeri-detail",
    "dokumen",
    "statistik",
    "apbdes",
    "kelompok",
    "inventaris",
    "surat",
    "status-desa",
    "survei",
    "triwulan",
    "bantuan",
    "kontak",
    "sinergi",
    "layanan-mandiri",
    "halaman",
  ],
  tataLetak: "polos",
};

/** Urutan tampil di halaman admin; tema pertama menjadi bawaan. */
export const THEME_MANIFESTS: readonly ThemeManifest[] = [ESENSI_MANIFEST, NATRA_MANIFEST];

/** Manifest tema bawaan (dipakai bila desa belum memilih tema). */
export const DEFAULT_THEME_MANIFEST: ThemeManifest = ESENSI_MANIFEST;
