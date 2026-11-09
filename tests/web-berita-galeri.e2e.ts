import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusAlbumGaleriDariNama, hapusBeritaDariJudul } from "./support/database";

/**
 * Katalog: OS-WEB-001 — Beranda tema menampilkan portal desa.
 */
test("elemen beranda tema dirender benar", async ({ app, browser }) => {
  await app.open("/");
  await expect(browser.locator("h1").first()).toContainText("Desa Contoh");
  await expect(browser.locator("body")).toContainText("Selamat datang di portal resmi desa.");
});

/**
 * Katalog: OS-WEB-002 — Berita: buat, tampil, detail + hit, pencarian.
 */
test(
  "berita: buat, tampil, detail, dan pencarian",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    const judul = `Berita E2E ${Date.now()}`;

    try {
      await app.open("/konten/berita");
      await screen.getByRole("link", { name: "Tulis Berita" }).tap();
      await screen.getByLabel("Judul").fill(judul);
      await screen.getByLabel("Ringkasan").fill("Ringkasan E2E");
      await screen.getByLabel("Isi (HTML)").fill("<p>Isi berita E2E</p>");
      await screen.getByLabel("Status").tap();
      await screen.getByRole("option", { name: "Terbit" }).tap();
      await screen.getByRole("button", { name: "Simpan berita" }).tap();
      await expect(screen.getByText("Berita ditambahkan.")).toBeVisible();

      await app.open("/desa/berita");
      await expect(screen.getByText(judul)).toBeVisible();

      await screen.getByText(judul).tap();
      await expect(browser).toHaveURL(/\/desa\/berita\/.+/);
      await expect(screen.getByText(/kali dibaca/i)).toBeVisible();

      await app.open("/desa/berita");
      await screen.getByPlaceholder(/Cari judul, ringkasan, atau isi berita/i).fill(judul);
      await screen.getByRole("button", { name: "Cari", exact: true }).tap();
      await expect(screen.getByText(judul)).toBeVisible();

      // Karakter wildcard SQL tidak boleh menjadi error.
      await screen.getByPlaceholder(/Cari judul, ringkasan, atau isi berita/i).fill("%");
      await screen.getByRole("button", { name: "Cari", exact: true }).tap();
      await expect(browser).not.toHaveURL(/error/i);
    } finally {
      await hapusBeritaDariJudul(judul);
    }
  },
);

/**
 * Katalog: OS-WEB-004 — Galeri: buat album lalu tampil di halaman publik.
 */
test(
  "galeri: buat album dan buka detail",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    const albumNama = `Album E2E ${Date.now()}`;

    try {
      await app.open("/konten/galeri");
      await screen.getByRole("button", { name: "Tambah Album" }).tap();
      await screen.getByLabel("Nama Album").fill(albumNama);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Album ditambahkan.")).toBeVisible();

      await app.open("/desa/galeri");
      await expect(screen.getByText(albumNama)).toBeVisible();

      await screen.getByText(albumNama).tap();
      await expect(browser).toHaveURL(/\/desa\/galeri\/.+/);
      await expect(screen.getByRole("button", { name: /Cetak Album/i })).toBeVisible();
    } finally {
      await hapusAlbumGaleriDariNama(albumNama);
    }
  },
);
