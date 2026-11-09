import { test } from "@e2e-dev/web";
import { expect, type Screen } from "e2e";

import {
  buatPendudukDptUji,
  hapusMutasiDariSurat,
  hapusPemilihanDptDariJudul,
  hapusPendudukDariNama,
  hapusPendudukDariNik,
  hapusSuplemenDariNama,
  idPendudukDariNik,
} from "./support/database";

/** NIK unik 16 digit untuk setiap test. */
function nikUnik(): string {
  return `3201${String(Date.now()).slice(-8)}${String(Math.floor(Math.random() * 10_000)).padStart(4, "0")}`;
}

function namaUnik(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

/** Buat penduduk lewat dialog tambah; selesai saat toast sukses tampil. */
async function buatPendudukLewatUi(
  screen: Screen,
  nik: string,
  nama: string,
  gender: "Laki-laki" | "Perempuan",
): Promise<void> {
  await screen.getByRole("button", { name: "Tambah Penduduk" }).tap();
  await screen.getByLabel("NIK").fill(nik);
  await screen.getByLabel("Nama Lengkap").fill(nama);
  await screen.getByLabel("Jenis Kelamin").tap();
  await screen.getByRole("option", { name: gender }).tap();
  await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
  await expect(screen.getByText("Data penduduk ditambahkan.")).toBeVisible();
}

/**
 * Katalog: OS-POP-001 — Penduduk: CRUD, pencarian, filter
 */
test(
  "penduduk: tambah, cari, ubah, dan hapus data",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const nik = nikUnik();
    const nama = namaUnik("Uji Penduduk");
    const namaBaru = `${nama} Ubah`;

    try {
      await app.open("/penduduk");
      await expect(browser.locator("h1")).toContainText("Penduduk");

      await buatPendudukLewatUi(screen, nik, nama, "Laki-laki");

      // --- Cari -----------------------------------------------------------
      await app.open(`/penduduk?q=${nik}`);
      await expect(screen.getByRole("row", { name: new RegExp(nama) })).toBeVisible();

      // --- Ubah -----------------------------------------------------------
      await screen.getByRole("button", { name: `Aksi untuk ${nama} (NIK ${nik})` }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Nama Lengkap").fill(namaBaru);
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Data penduduk diperbarui.")).toBeVisible();

      await app.open(`/penduduk?q=${nik}`);
      await expect(screen.getByRole("row", { name: new RegExp(namaBaru) })).toBeVisible();

      // --- Hapus ----------------------------------------------------------
      await screen.getByRole("button", { name: `Aksi untuk ${namaBaru} (NIK ${nik})` }).tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await expect(screen.getByText("Hapus data penduduk?")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Data penduduk dihapus.")).toBeVisible();

      await app.open(`/penduduk?q=${nik}`);
      await expect(screen.getByText("Tidak ada penduduk yang cocok dengan filter.")).toBeVisible();
    } finally {
      await hapusPendudukDariNik(nik);
    }
  },
);

/**
 * Katalog: OS-POP-001 — detail dan cetak biodata
 */
test(
  "penduduk: detail dan cetak biodata",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const nik = nikUnik();
    const nama = namaUnik("Cetak Penduduk");

    try {
      await app.open("/penduduk");
      await buatPendudukLewatUi(screen, nik, nama, "Perempuan");

      const id = await idPendudukDariNik(nik);
      expect(id).not.toBeNull();

      await app.open(`/penduduk/${id}`);
      await expect(browser.locator("h1")).toContainText("Biodata Penduduk");
      await expect(screen.getByText(nama).first()).toBeVisible();
      await expect(screen.getByText(nik)).toBeVisible();

      const cetak = screen.getByRole("link", { name: "Cetak Biodata" });
      await expect(cetak).toHaveAttribute("href", `/penduduk/${id}/cetak`);
      // Tautan membuka tab baru; runner mencatat tab itu, test tetap di halaman ini.
      await cetak.tap();

      await app.open(`/penduduk/${id}/cetak`);
      await expect(browser.locator("h1")).toContainText("BIODATA PENDUDUK");
      await expect(screen.getByText(nama).first()).toBeVisible();
      await expect(screen.getByText(nik)).toBeVisible();
    } finally {
      await hapusPendudukDariNik(nik);
    }
  },
);

/**
 * Katalog: OS-POP-002 — riwayat penduduk: catat kelahiran
 */
test(
  "penduduk: catat kelahiran pada riwayat",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const namaBayi = namaUnik("Bayi Uji");
    const surat = `474/${Date.now()}/UJI/2026`;

    try {
      await app.open("/penduduk/riwayat");
      await expect(browser.locator("h1")).toContainText("Riwayat Penduduk");

      await screen.getByRole("button", { name: "Catat Riwayat" }).tap();
      await screen.getByRole("menuitem", { name: "Catat Kelahiran" }).tap();
      await screen.getByLabel("Nama Bayi *").fill(namaBayi);
      await screen.getByLabel("Tanggal Lahir *").fill("2026-01-05");
      await screen.getByLabel("Nama Ibu").fill("Ibu Uji");
      await screen.getByLabel("No. Surat Kelahiran").fill(surat);
      await screen.getByRole("button", { name: "Simpan" }).tap();
      await expect(screen.getByText("Kelahiran berhasil dicatat.")).toBeVisible();

      // Bayi masuk ke data penduduk.
      await app.open(`/penduduk?q=${encodeURIComponent(namaBayi)}`);
      await expect(screen.getByRole("row", { name: new RegExp(namaBayi) })).toBeVisible();

      // Mutasi tercatat pada riwayat dan dapat dicari lewat nomor surat.
      await app.open(`/penduduk/riwayat?q=${encodeURIComponent(surat)}`);
      await expect(
        screen.getByRole("row", { name: new RegExp(surat.replace(/\//g, "\\/")) }),
      ).toBeVisible();
    } finally {
      await hapusMutasiDariSurat(surat);
      await hapusPendudukDariNama(namaBayi);
    }
  },
);

/**
 * Katalog: OS-POP-001 — filter dan ekspor
 */
test(
  "penduduk: filter menyaring daftar dan tautan ekspor CSV",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/penduduk");
    await screen.getByLabel("Cari penduduk").fill("tidak-ada-nama-ini");
    await screen.getByRole("button", { name: "Cari" }).tap();
    await expect(browser).toHaveURL(/q=tidak-ada-nama-ini/);
    await expect(screen.getByText("Tidak ada penduduk yang cocok dengan filter.")).toBeVisible();
    await expect(screen.getByRole("link", { name: "Ekspor CSV" })).toHaveAttribute(
      "href",
      /\/penduduk\/ekspor/,
    );
  },
);

/**
 * Katalog: OS-POP-005 — DPT: kelola pemilihan, filter, ekspor, dan rekap.
 */
test(
  "dpt: pemilihan aktif, filter pemilih, ekspor, dan rekap",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const judul = `Pemilihan E2E ${cap}`;
    const judulKedua = `Pemilihan Ganda E2E ${cap}`;
    const nik = nikUnik();
    const nama = namaUnik("Pemilih DPT");

    try {
      await buatPendudukDptUji(nik, nama);

      await app.open("/penduduk/dpt");
      await expect(browser.locator("h1")).toContainText("DPT");
      await expect(screen.getByText(/Tidak ada pemilihan aktif/)).toBeVisible();

      // --- Buat pemilihan aktif ------------------------------------------
      await screen.getByRole("button", { name: "Kelola Pemilihan" }).tap();
      let dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Judul Pemilihan *").fill(judul);
      await dialog.getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Aktif (DPT)" }).tap();
      await dialog.getByLabel("Tanggal Pemilihan *").fill("2026-11-10");
      await dialog.getByLabel("Keterangan").fill("Data uji E2E");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();

      // Dialog memuat ulang halaman setelah sukses.
      await expect(browser.locator("body")).toContainText(judul, { timeout: 15_000 });
      await expect(screen.getByText(/Daftar pemilih berdasarkan pemilihan aktif/)).toBeVisible();

      // --- Hanya satu pemilihan aktif ------------------------------------
      await screen.getByRole("button", { name: "Kelola Pemilihan" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Judul Pemilihan *").fill(judulKedua);
      await dialog.getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Aktif (DPT)" }).tap();
      await dialog.getByLabel("Tanggal Pemilihan *").fill("2026-11-10");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog.getByText(/Sudah ada pemilihan aktif/)).toBeVisible();
      await dialog.getByRole("button", { name: "Batal" }).tap();

      // --- Filter mencari pemilih ----------------------------------------
      await screen.getByLabel("Cari nama/NIK").fill(nama);
      await screen.getByRole("button", { name: "Terapkan Filter" }).tap();
      await expect(browser).toHaveURL(/search=/);
      const baris = screen.getByRole("row").filter({ hasText: nama });
      await expect(baris).toBeVisible();
      await expect(baris.getByText(nik)).toBeVisible();

      // --- Ekspor memakai filter dan pemilihan aktif ----------------------
      const csv = await browser.evaluate(async () => {
        const tautan = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
          a.textContent?.includes("Ekspor CSV"),
        );
        if (!tautan) return { status: 0, body: "" };
        const res = await fetch(tautan.href);
        return { status: res.status, body: await res.text() };
      });
      expect(csv.status).toBe(200);
      expect(csv.body).toContain(judul);
      expect(csv.body).toContain(nama);
      expect(csv.body).toContain(nik);

      // --- Rekap per wilayah ---------------------------------------------
      await screen.getByRole("link", { name: "Rekap" }).tap();
      await expect(browser).toHaveURL(/\/penduduk\/dpt\/rekap$/);
      await expect(browser.locator("h1")).toContainText("Rekapitulasi DPT");
      await expect(screen.getByRole("table")).toBeVisible();
      await expect(screen.getByRole("cell", { name: "Jumlah", exact: true })).toBeVisible();
    } finally {
      await hapusPemilihanDptDariJudul(judulKedua);
      await hapusPemilihanDptDariJudul(judul);
      await hapusPendudukDariNik(nik);
    }
  },
);

/**
 * Katalog: OS-POP-007 — data suplemen: definisi jenis
 */
test(
  "suplemen: tambah definisi suplemen baru",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    const nama = namaUnik("Suplemen Uji");

    try {
      await app.open("/penduduk/suplemen");
      await expect(browser.locator("h1")).toContainText("Data Suplemen");

      await screen.getByRole("button", { name: "Tambah Suplemen Baru" }).tap();
      await screen.getByPlaceholder("Contoh: Bantuan Subsidi").fill(nama);
      await screen.getByRole("button", { name: "Simpan" }).tap();
      await expect(screen.getByText("Tambah Data Suplemen")).not.toBeVisible();

      await app.open(`/penduduk/suplemen?search=${encodeURIComponent(nama)}`);
      await expect(screen.getByText(nama)).toBeVisible();
    } finally {
      await hapusSuplemenDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-POP-006 — DTKS: dialog impor, laporan, dan pengaturan program
 */
test(
  "dtks: halaman data, dialog impor, laporan, dan program",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/penduduk/dtks");
    await expect(browser.locator("h1")).toContainText("DTKS");

    await screen.getByRole("button", { name: "Impor", exact: true }).tap();
    await expect(screen.getByText("Impor DTKS")).toBeVisible();
    await expect(screen.getByLabel("Berkas")).toBeVisible();
    await screen.getByRole("button", { name: "Tutup" }).tap();
    await expect(screen.getByText("Impor DTKS")).not.toBeVisible();

    await app.open("/penduduk/dtks/laporan");
    await expect(browser.locator("h1")).toContainText("Laporan");

    await app.open("/penduduk/dtks/pengaturan");
    await expect(browser.locator("h1")).toContainText("Program");
  },
);

/**
 * Katalog: OS-POP-010 — laporan kependudukan per kategori
 */
test(
  "laporan kependudukan: kategori dan tautan ekspor",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/penduduk/laporan");
    await expect(browser.locator("h1")).toContainText("Laporan Kependudukan");
    await expect(screen.getByRole("link", { name: "Ekspor CSV" })).toHaveAttribute(
      "href",
      /\/penduduk\/laporan\/ekspor/,
    );

    await screen.getByRole("link", { name: "Menurut Umur" }).tap();
    await expect(browser).toHaveURL(/jenis=umur/);
    await expect(browser.locator("h1")).toContainText("Laporan Kependudukan");
  },
);
