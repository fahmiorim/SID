import { esensi } from "@/themes/esensi";
import type { ThemeComponents } from "@/themes/kontrak";

import { NatraLayout } from "./layout";
import { manifest } from "./manifest";
import { NatraHome } from "./pages/home";

import "./theme.css";

/**
 * Paket komponen tema `natra`.
 *
 * Hanya `layout` dan `home` yang dibuat khusus; slot lain **dipakai ulang** dari
 * tema `esensi` dengan gaya warna yang tetap mengikuti CSS variable tema aktif.
 * Cara ini menjaga tema baru tetap ringkas: cukup tambah folder + manifest, lalu
 * timpa halaman yang memang ingin dibedakan.
 */
export const natra: ThemeComponents = {
  ...esensi,
  manifest,
  layout: NatraLayout,
  home: NatraHome,
};
