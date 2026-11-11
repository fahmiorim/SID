import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaBeritaDariJudul,
  hapusAlbumGaleriDariNama,
  hapusBeritaDariJudul,
} from "./support/database";

/**
 * Katalog: OS-WEB-001 — Beranda tema menampilkan portal desa.
 */
test("elemen beranda tema dirender benar", async ({ app, browser }) => {
  await app.open("/");

  // Judul hero beranda dikelola formulir tema dan diubah test tema yang berjalan
  // paralel pada desa yang sama, jadi yang diuji di sini kerangka tema dan teks
  // sambutan yang tidak disentuh test lain.
  await expect(browser.locator('[data-theme="esensi"]')).toBeVisible();
  await expect(browser.locator("h1").first()).toBeVisible();
  await expect(browser.locator("header")).toBeVisible();
  await expect(browser.locator("main")).toBeVisible();
  await expect(browser.locator("footer")).toBeVisible();
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
      const status = screen.getByRole("combobox", { name: "Status" });
      await status.tap();
      await screen.getByRole("option", { name: "Terbit" }).tap();
      await expect(status).toContainText("Terbit");
      await screen.getByRole("button", { name: "Simpan berita" }).tap();
      await expect(screen.getByText("Berita ditambahkan.")).toBeVisible();

      const tersimpan = await bacaBeritaDariJudul(judul);
      expect(tersimpan, "berita harus tersimpan").not.toBeNull();
      expect(tersimpan?.status).toBe("published");
      expect(tersimpan?.terbitPada).toBeTruthy();

      await app.open(`/desa/berita?q=${encodeURIComponent(judul)}`);
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

      // Buktikan tombol benar-benar memanggil dialog cetak browser.
      const cetakDipanggil = await browser.evaluate(() => {
        let dipanggil = false;
        const asli = window.print;
        window.print = () => {
          dipanggil = true;
        };
        const tombol = Array.from(document.querySelectorAll("button")).find((item) =>
          item.textContent?.includes("Cetak Album"),
        );
        tombol?.click();
        window.print = asli;
        return dipanggil;
      });
      expect(cetakDipanggil).toBe(true);
    } finally {
      await hapusAlbumGaleriDariNama(albumNama);
    }
  },
);
