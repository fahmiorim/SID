import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKeuanganTahun, hapusSisaLebihDariKeterangan } from "./support/database";

const TAHUN = 2099;

/**
 * Katalog: OS-FIN-001 — Pagu & realisasi APBDes per rekening
 */
test(
  "APBDes: isi pagu dan realisasi lalu tersimpan",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    try {
      await app.open(`/keuangan/anggaran?tahun=${TAHUN}`);
      await expect(browser.locator("h1")).toContainText("APBDes");

      const baris = screen.getByRole("row").filter({ hasText: "HASIL USAHA" });
      const pagu = baris.getByRole("textbox").first();
      const realisasi = baris.getByRole("textbox").last();

      await pagu.fill("12000000");
      await realisasi.fill("3000000");
      await expect(screen.getByText("1 baris berubah")).toBeVisible();
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anggaran & realisasi disimpan.")).toBeVisible();

      await app.open(`/keuangan/anggaran?tahun=${TAHUN}`);
      await expect(
        screen.getByRole("row").filter({ hasText: "HASIL USAHA" }).getByRole("textbox").first(),
      ).toHaveValue(/12\.000\.000|12000000/);
    } finally {
      await hapusKeuanganTahun(TAHUN);
    }
  },
);

/**
 * Katalog: OS-FIN-002 — Laporan RP APBDes, filter bidang, dan ekspor
 */
test(
  "laporan keuangan: filter bidang dan tautan ekspor",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open(`/keuangan/laporan?tahun=${TAHUN}`);
    await expect(browser.locator("h1")).toContainText("Laporan Keuangan");
    await expect(screen.getByRole("combobox")).toBeVisible();
    await expect(screen.getByRole("link", { name: /Ekspor CSV/ })).toHaveAttribute(
      "href",
      /ekspor\?tahun=2099/,
    );
    await expect(screen.getByRole("link", { name: /Rincian Realisasi/ })).toHaveAttribute(
      "href",
      /realisasi\?tahun=2099/,
    );
  },
);

/**
 * Katalog: OS-FIN-003 — Realisasi per triwulan
 */
test(
  "triwulan: realisasi TW I tersimpan",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    try {
      await app.open(`/keuangan/anggaran?tahun=${TAHUN}`);
      const baris = screen.getByRole("row").filter({ hasText: "HASIL USAHA" });
      await baris.getByRole("textbox").first().fill("5000000");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anggaran & realisasi disimpan.")).toBeVisible();

      await app.open(`/keuangan/triwulan?tahun=${TAHUN}`);
      await expect(browser.locator("h1")).toContainText("Triwulan");

      const tw1 = screen.getByLabel(/TW1$/).first();
      await tw1.fill("1250000");
      await expect(screen.getByText("1 bidang berubah")).toBeVisible();
      await screen.getByRole("button", { name: "Simpan Realisasi" }).tap();
      await expect(screen.getByText("Realisasi triwulan disimpan.")).toBeVisible();
      await expect(tw1).toHaveValue(/1\.250\.000|1250000/);
    } finally {
      await hapusKeuanganTahun(TAHUN);
    }
  },
);

/**
 * Katalog: OS-FIN-005 — Pencatatan SiLPA
 */
test(
  "SiLPA: tambah, ubah, dan hapus catatan",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const keterangan = `SiLPA uji ${Date.now()}`;

    try {
      await app.open("/keuangan/sisa-lebih");
      await expect(screen.getByRole("heading", { name: "Sisa Lebih Pembiayaan" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Data" }).tap();
      await screen.getByLabel("Tahun Anggaran").fill("2098");
      await screen.getByLabel("Jumlah").fill("7500000");
      await screen.getByLabel("Tanggal").fill("2026-01-15");
      await screen.getByLabel("Keterangan").fill(keterangan);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil ditambahkan.")).toBeVisible();

      const baris = screen.getByRole("row").filter({ hasText: keterangan });
      await expect(baris).toBeVisible();
      await baris.getByRole("button", { name: "Ubah" }).tap();
      await screen.getByLabel("Keterangan").fill(`${keterangan} baru`);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil diperbarui.")).toBeVisible();

      await screen
        .getByRole("row")
        .filter({ hasText: `${keterangan} baru` })
        .getByRole("button", {
          name: "Ubah",
        })
        .tap();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil dihapus.")).toBeVisible();
    } finally {
      await hapusSisaLebihDariKeterangan(keterangan);
      await hapusSisaLebihDariKeterangan(`${keterangan} baru`);
    }
  },
);

/**
 * Katalog: OS-FIN-005 — halaman turunan keuangan tetap merender data
 */
test(
  "rekonsiliasi, jurnal, dan pembukuan menampilkan ringkasan",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    await app.open(`/keuangan/rekonsiliasi?tahun=${TAHUN}`);
    await expect(browser.locator("h1")).toContainText("Rekonsiliasi");

    await app.open(`/keuangan/jurnal?tahun=${TAHUN}`);
    await expect(browser.locator("h1")).toContainText("Jurnal");

    await app.open("/keuangan/pembukuan");
    await expect(browser.locator("h1")).toContainText("Pembukuan");

    await app.open("/keuangan/laporan-dokumen");
    await expect(browser.locator("h1")).toContainText("Dokumen");
    await expect(screen.getByRole("button", { name: /impor dokumen/i })).toBeVisible();
  },
);
