import type { ReactNode } from "react";

import type { StatistikDesa, SuratPublikRow } from "@/features/desa/application/statistik-desa";
import type { IdentitasDesa } from "@/features/desa/infrastructure/desa-repository";
import type { ThemeOptions } from "@/features/publik/domain/theme";
import type {
  BeritaDetail,
  BeritaRingkas,
} from "@/features/publik/infrastructure/content-repository";

/**
 * Kontrak data yang diberikan halaman publik kepada tema (Fase 1D).
 *
 * Halaman rute **hanya** mengambil data (infrastruktur + resolusi tenant) lalu
 * menyerahkannya sebagai `props` ke komponen tema di `src/themes/<slug>/`.
 * Tema bertanggung jawab atas tata letak & gaya, bukan atas query basis data.
 * Dengan begitu satu tema dapat diganti tanpa menyentuh halaman rute.
 */

/** Konteks desa + navigasi yang tersedia di setiap komponen tema. */
export interface ThemeContext {
  desa: IdentitasDesa;
  menu: { href: string; label: string }[];
  /** Opsi tema tervalidasi (warna, font, hero, widget). */
  opsi: ThemeOptions;
  tema: {
    slug: string;
    nama: string;
    /** Nilai CSS variable hasil `themeCssVars`. */
    cssVars: Record<string, string>;
  };
}

/** Props yang selalu diterima layout tema. */
export interface LayoutProps {
  ctx: ThemeContext;
  children: ReactNode;
}

export interface HomeProps {
  ctx: ThemeContext;
  sambutan: string | null;
  slider: { id: number; gambar: string | null; judul: string | null }[];
  statistik: StatistikDesa;
  berita: BeritaRingkas[];
  surat: SuratPublikRow[];
}

export interface ProfilProps {
  ctx: ThemeContext;
  profil: {
    visi: string | null;
    misi: string[];
    sejarah: string | null;
    sambutan: string | null;
    koordinat: string | null;
  } | null;
}

export interface PerangkatProps {
  ctx: ThemeContext;
  perangkat: {
    id: number;
    nama: string;
    jabatan: string | null;
    nip: string | null;
    foto: string | null;
    periode: string | null;
  }[];
}

export interface BeritaListProps {
  ctx: ThemeContext;
  berita: BeritaRingkas[];
  kategori: { id: number; nama: string; slug: string }[];
  kategoriAktif: string | null;
}

export interface BeritaDetailProps {
  ctx: ThemeContext;
  berita: BeritaDetail;
  terkait: BeritaRingkas[];
}

export interface GaleriListProps {
  ctx: ThemeContext;
  album: {
    id: number;
    nama: string;
    slug: string;
    keterangan: string | null;
    sampul: string | null;
    jumlahFoto: number;
  }[];
}

export interface GaleriDetailProps {
  ctx: ThemeContext;
  album: { id: number; nama: string; keterangan: string | null };
  foto: { id: number; gambar: string | null; judul: string | null; keterangan: string | null }[];
}

export interface DokumenProps {
  ctx: ThemeContext;
  dokumen: {
    id: number;
    nama: string;
    kategori: string;
    jenis: string | null;
    nomor: string | null;
    tahun: number | null;
    berkas: string | null;
    tautan: string | null;
    keterangan: string | null;
  }[];
}

export interface StatistikProps {
  ctx: ThemeContext;
  statistik: StatistikDesa;
}

export interface ApbdesProps {
  ctx: ThemeContext;
  laporan: {
    tahun: number;
    baris: { kode: string; uraian: string; anggaran: string; realisasi: string; selisih: string }[];
    total: { anggaran: string; realisasi: string; selisih: string };
    bidang: { kode: string; uraian: string; anggaran: string; realisasi: string; persen: number }[];
  };
}

export interface BantuanProps {
  ctx: ThemeContext;
  program: {
    id: number;
    nama: string;
    slug: string;
    sasaran: number;
    asalDana: number | null;
    keterangan?: string | null;
  }[];
}

export interface KontakProps {
  ctx: ThemeContext;
}

export interface HalamanProps {
  ctx: ThemeContext;
  judul: string;
  isi: string;
}

export interface LayananMandiriProps {
  ctx: ThemeContext;
}
