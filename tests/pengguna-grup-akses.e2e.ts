import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaIzinGrupUji,
  hapusGrupDariNama,
  hapusModulDariSlug,
  hapusPenggunaDariUsername,
} from "./support/database";

/**
 * Katalog: OS-OPS-001 — pengguna, grup, modul, hak akses, menu, dan pewarisan
 * akses.
 *
 * Dua alur: CRUD modul lewat UI, lalu grup + izin baca satu modul anak dan
 * pengguna dengan grup tersebut. Setelah login sebagai pengguna itu, menu
 * induk harus tetap muncul karena izin anak diwariskan, sedangkan modul lain
 * harus ditolak.
 */
test(
  "modul: tambah, ubah, dan hapus lewat UI",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const tanda = Date.now().toString().slice(-8);
    const namaAwal = `Modul E2E ${tanda}`;
    const namaBaru = `Modul E2E Diubah ${tanda}`;
    const slug = `modul-e2e-${tanda}`;

    try {
      await app.open("/pengaturan/modul");
      await expect(screen.getByRole("heading", { name: "Modul" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Modul" }).tap();
      let dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Nama Modul").fill(namaAwal);
      await dialog.getByLabel("Slug").fill(slug);
      await dialog.getByLabel("URL").fill(`/e2e/${slug}`);
      await dialog.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      let baris = screen.getByRole("row").filter({ hasText: namaAwal });
      await expect(baris).toBeVisible();
      await expect(baris.getByText(slug)).toBeVisible();

      await baris.getByRole("button").last().tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Nama Modul").fill(namaBaru);
      await dialog.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      baris = screen.getByRole("row").filter({ hasText: namaBaru });
      await expect(baris).toBeVisible();
      await baris.getByRole("button").last().tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      const konfirmasi = screen.getByRole("alertdialog");
      await expect(konfirmasi.getByText("Hapus modul?")).toBeVisible();
      await konfirmasi.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(konfirmasi).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText(namaBaru)).toHaveCount(0);
    } finally {
      await hapusModulDariSlug(slug);
    }
  },
);
test(
  "grup dan pengguna: izin modul anak diwariskan ke menu induk",
  { session: "admin", timeout: 180_000 },
  async ({ app, browser, screen }) => {
    const tanda = Date.now().toString().slice(-8);
    const namaGrup = `Grup E2E ${tanda}`;
    const username = `e2e.grup.${tanda}`;
    const namaPengguna = `Pengguna Grup E2E ${tanda}`;
    const kataSandi = "Rahasia#12345";

    try {
      await app.open("/pengaturan/grup");
      await expect(screen.getByRole("heading", { name: "Grup & Hak Akses" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Grup" }).tap();
      let dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Nama Grup").fill(namaGrup);
      await dialog.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      const tautanGrup = screen.getByRole("link", { name: namaGrup });
      await expect(tautanGrup).toBeVisible();
      await tautanGrup.tap();
      await expect(screen.getByRole("heading", { name: `Hak Akses — ${namaGrup}` })).toBeVisible();

      // Modul "Identitas Desa" adalah anak dari grup menu "Pengaturan". Cukup
      // centang read pada anak; induknya harus ikut terbaca lewat pewarisan.
      const barisIzin = screen.getByRole("row").filter({ hasText: "Identitas Desa" });
      const izinBaca = barisIzin.getByRole("checkbox").first();
      await izinBaca.tap();
      await expect(izinBaca).toBeChecked();
      // Pastikan input tersembunyi Radix benar-benar ikut terkirim sebagai
      // `perm:<id>:read`, bukan hanya status visual tombol.
      const namaIzinTerkirim = await browser.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('input[name^="perm:"]:checked');
        return input ? input.name : null;
      });
      expect(namaIzinTerkirim).toMatch(/^perm:\d+:read$/);
      await screen.getByRole("button", { name: "Simpan Hak Akses" }).tap();
      await expect(screen.getByText("Hak akses disimpan.")).toBeVisible({ timeout: 15_000 });
      expect(await bacaIzinGrupUji(namaGrup, "identitas-desa")).toBe("read");

      await app.open("/pengaturan/pengguna");
      await expect(screen.getByRole("heading", { name: "Pengguna" })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah Pengguna" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Nama Lengkap").fill(namaPengguna);
      await dialog.getByLabel("Username").fill(username);
      await dialog.getByRole("combobox").tap();
      await screen.getByRole("option", { name: namaGrup }).tap();
      await dialog.getByLabel("Kata Sandi").fill(kataSandi);
      await dialog.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 20_000 });

      const barisPengguna = screen.getByRole("row").filter({ hasText: username });
      await expect(barisPengguna).toBeVisible();
      await expect(barisPengguna.getByText(namaGrup)).toBeVisible();
      await expect(barisPengguna.getByText("Aktif")).toBeVisible();

      // Masuk sebagai pengguna baru: sesi admin sengaja dibuang.
      await app.clearState();
      await app.open("/masuk");
      await screen.getByLabel("Username atau NIK").fill(username);
      await screen.getByLabel("Kata sandi / PIN").fill(kataSandi);

      const labelCaptcha = await browser.locator('label[for="jawaban"]').textContent();
      const cocok = labelCaptcha?.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
      if (!cocok) throw new Error(`Label captcha tidak dikenali: ${labelCaptcha}`);
      const kiri = Number(cocok[1]);
      const kanan = Number(cocok[3]);
      const jawaban = cocok[2] === "+" ? kiri + kanan : kiri - kanan;
      await browser.locator('input[name="jawaban"]').fill(String(jawaban));
      await screen.getByRole("button", { name: "Masuk" }).tap();
      await expect(browser).toHaveURL("/beranda", { timeout: 20_000 });

      await app.open("/pengaturan/desa");
      await expect(screen.getByRole("heading", { name: "Identitas Desa" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Identitas Desa" })).toBeVisible();

      await app.open("/pengaturan/pengguna");
      await expect(screen.getByRole("heading", { name: "Pengguna" })).toBeVisible();
      await expect(screen.getByText("Akses ditolak")).toBeVisible();
      await expect(
        screen.getByText(/tidak memiliki hak akses untuk membuka modul ini/i),
      ).toBeVisible();
    } finally {
      await hapusPenggunaDariUsername(username);
      await hapusGrupDariNama(namaGrup);
    }
  },
);
