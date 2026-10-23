import type { ComponentType } from "react";

import type { ThemeManifest, ThemeSlot } from "@/features/publik/domain/theme";

import type {
  ApbdesProps,
  BantuanProps,
  BeritaDetailProps,
  BeritaListProps,
  DokumenProps,
  GaleriDetailProps,
  GaleriListProps,
  HalamanProps,
  HomeProps,
  InventarisProps,
  KelompokProps,
  KontakProps,
  LayananMandiriProps,
  LayoutProps,
  PerangkatProps,
  ProfilProps,
  StatistikProps,
  StatusDesaProps,
  SuratProps,
  SurveiProps,
  TriwulanProps,
} from "./types";

/**
 * Komponen wajib sebuah tema (Fase 1D.3/1D.4).
 *
 * Sebuah tema **wajib** menyediakan `layout`, `home`, dan seluruh slot lain
 * agar halaman rute dapat memanggilnya tanpa pengecekan `undefined`. Bila tema
 * tidak ingin menyesuaikan suatu halaman, cukup mengekspor ulang komponen dari
 * tema `esensi` (lihat `src/themes/esensi/index.tsx`).
 */
export interface ThemeComponents {
  manifest: ThemeManifest;
  layout: ComponentType<LayoutProps>;
  home: ComponentType<HomeProps>;
  profil: ComponentType<ProfilProps>;
  perangkat: ComponentType<PerangkatProps>;
  berita: ComponentType<BeritaListProps>;
  beritaDetail: ComponentType<BeritaDetailProps>;
  galeri: ComponentType<GaleriListProps>;
  galeriDetail: ComponentType<GaleriDetailProps>;
  dokumen: ComponentType<DokumenProps>;
  statistik: ComponentType<StatistikProps>;
  apbdes: ComponentType<ApbdesProps>;
  kelompok: ComponentType<KelompokProps>;
  inventaris: ComponentType<InventarisProps>;
  surat: ComponentType<SuratProps>;
  statusDesa: ComponentType<StatusDesaProps>;
  survei: ComponentType<SurveiProps>;
  triwulan: ComponentType<TriwulanProps>;
  bantuan: ComponentType<BantuanProps>;
  kontak: ComponentType<KontakProps>;
  layananMandiri: ComponentType<LayananMandiriProps>;
  halaman: ComponentType<HalamanProps>;
}

/** Verifikasi manifest mengklaim seluruh slot yang diimplementasikan. */
export function slotTerpenuhi(manifest: ThemeManifest): boolean {
  const dibutuhkan: ThemeSlot[] = [
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
    "layanan-mandiri",
    "halaman",
  ];
  return dibutuhkan.every((slot) => manifest.slot.includes(slot));
}
