import type { ThemeComponents } from "@/themes/kontrak";

import { EsensiLayout } from "./layout";
import { manifest } from "./manifest";
import { EsensiApbdes } from "./pages/apbdes";
import { EsensiBantuan } from "./pages/bantuan";
import { EsensiBerita } from "./pages/berita";
import { EsensiBeritaDetail } from "./pages/berita-detail";
import { EsensiDokumen } from "./pages/dokumen";
import { EsensiGaleri } from "./pages/galeri";
import { EsensiGaleriDetail } from "./pages/galeri-detail";
import { EsensiHalaman } from "./pages/halaman";
import { EsensiHome } from "./pages/home";
import { EsensiKontak } from "./pages/kontak";
import { EsensiLayananMandiri } from "./pages/layanan-mandiri";
import { EsensiPerangkat } from "./pages/perangkat";
import { EsensiProfil } from "./pages/profil";
import { EsensiStatistik } from "./pages/statistik";

import "./theme.css";

/** Paket komponen tema `esensi` (lihat `src/themes/kontrak.ts`). */
export const esensi: ThemeComponents = {
  manifest,
  layout: EsensiLayout,
  home: EsensiHome,
  profil: EsensiProfil,
  perangkat: EsensiPerangkat,
  berita: EsensiBerita,
  beritaDetail: EsensiBeritaDetail,
  galeri: EsensiGaleri,
  galeriDetail: EsensiGaleriDetail,
  dokumen: EsensiDokumen,
  statistik: EsensiStatistik,
  apbdes: EsensiApbdes,
  bantuan: EsensiBantuan,
  kontak: EsensiKontak,
  layananMandiri: EsensiLayananMandiri,
  halaman: EsensiHalaman,
};
