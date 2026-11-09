import type { ReactNode } from "react";

import type { StatistikDesa, SuratPublikRow } from "@/features/desa/application/statistik-desa";
import type { StatistikPublik } from "@/features/desa/application/statistik-publik";
import type { IdentitasDesa } from "@/features/desa/infrastructure/desa-repository";
import type { TriwulanBaris, TriwulanTotal } from "@/features/keuangan/domain/laporan-triwulan";
import type { HasilSurveiPublik, SurveiPublik } from "@/features/publik/application/survei-publik";
import type { DokumenKategoriFilter, KelompokArsipDokumen } from "@/features/publik/domain/dokumen";
import type { FilterInventarisPublik } from "@/features/publik/domain/inventaris-publik";
import type { PublicNavItem } from "@/features/publik/domain/menu";
import type { RekapInventaris } from "@/features/publik/domain/ringkasan-publik";
import type { ThemeOptions } from "@/features/publik/domain/theme";
import type {
  AgendaPublikRingkas,
  BeritaDetail,
  BeritaRingkas,
} from "@/features/publik/infrastructure/content-repository";
import type { JenisSuratPublik } from "@/features/surat/application/surat-publik-use-cases";

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
  menu: PublicNavItem[];
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
  widget: { id: number; judul: string | null; isi: string | null; jenis: number }[];
  berita: BeritaRingkas[];
  surat: SuratPublikRow[];
  agenda: AgendaPublikRingkas[];
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
    gelarDepan: string | null;
    gelarBelakang: string | null;
    jabatan: string | null;
    nip: string | null;
    foto: string | null;
    periode: string | null;
    urut: number;
  }[];
}

export interface BeritaListProps {
  ctx: ThemeContext;
  berita: BeritaRingkas[];
  kategori: { id: number; nama: string; slug: string }[];
  kategoriAktif: string | null;
  cari: string;
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
  cari: string;
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
  search: string;
  category: DokumenKategoriFilter;
  year?: number;
  jenis: string;
  /** Ringkasan arsip per tahun & jenis (OS-WEB-005). */
  arsip: KelompokArsipDokumen[];
  page: number;
  pageSize: number;
  total: number;
}

export interface StatistikProps {
  ctx: ThemeContext;
  statistik: StatistikPublik;
  /** Realisasi per triwulan (OS-WEB-006). */
  periode: { triwulan: number; label: string; realisasi: string; persen: number }[];
}

export interface KelompokProps {
  ctx: ThemeContext;
  kelompok: {
    id: number;
    nama: string;
    tipe: string;
    kategori: string | null;
    ketua: string | null;
    jumlahAnggota: number;
    kode: string | null;
    keterangan: string | null;
    /** Anggota yang dipublikasikan (OS-WEB-010). */
    anggota: { id: number; nama: string; jabatan: number; nomorAnggota: string | null }[];
  }[];
}

export interface InventarisProps {
  ctx: ThemeContext;
  rekap: RekapInventaris;
  /** Filter aktif dari query string (OS-WEB-011). */
  filter: FilterInventarisPublik;
  /** Pilihan filter yang tersedia pada data desa. */
  opsi: { kategori: string[]; lokasi: string[]; tahun: number[] };
  /** Tautan ekspor CSV dengan filter yang sama. */
  eksporUrl: string;
  inventaris: {
    id: number;
    nama: string;
    kategori: string | null;
    kode: string | null;
    jumlah: string;
    satuan: string | null;
    kondisi: string;
    lokasi: string | null;
    tahun: number | null;
    nilai: string | null;
  }[];
}

export interface SuratProps {
  ctx: ThemeContext;
  jenis: JenisSuratPublik[];
}

export interface StatusDesaProps {
  ctx: ThemeContext;
  desa: IdentitasDesa;
  inventaris: RekapInventaris;
}

export interface SurveiProps {
  ctx: ThemeContext;
  survei: SurveiPublik[];
  /** Rekap agregat tanpa data pribadi (OS-WEB-013). */
  hasil: HasilSurveiPublik[];
  tahun: number | null;
  tahunTersedia: number[];
}

export interface TriwulanProps {
  ctx: ThemeContext;
  tahun: number;
  tersedia: number[];
  baris: TriwulanBaris[];
  total: TriwulanTotal;
}

export interface ApbdesProps {
  ctx: ThemeContext;
  laporan: {
    tahun: number;
    tersedia: number[];
    baris: { kode: string; uraian: string; anggaran: string; realisasi: string; selisih: string }[];
    total: { anggaran: string; realisasi: string; selisih: string };
    bidang: { kode: string; uraian: string; anggaran: string; realisasi: string; persen: number }[];
    periode: { triwulan: number; label: string; realisasi: string; persen: number }[];
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

export interface SinergiProps {
  ctx: ThemeContext;
  program: {
    id: number;
    nama: string;
    mitra: string | null;
    tahun: number | null;
    tanggalMulai: string | null;
    tanggalSelesai: string | null;
    keterangan: string | null;
  }[];
}

export interface KontakProps {
  ctx: ThemeContext;
  /** Tantangan captcha untuk form umpan balik (OS-WEB-015). */
  captcha: { pertanyaan: string; token: string };
}

export interface HalamanProps {
  ctx: ThemeContext;
  judul: string;
  isi: string;
}

export interface LayananMandiriProps {
  ctx: ThemeContext;
}
