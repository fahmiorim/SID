import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKesehatanDariNoKia, hapusPosyanduDariNama } from "./support/database";

/**
 * Katalog: OS-POP-008 — KIA, pemantauan ibu hamil, dan pemantauan anak.
 *
 * Data dibuat lewat form admin, lalu dibaca kembali dari tabel dan ekspor CSV.
 * Posyandu baru diperlukan karena database uji tidak menyemai posyandu.
 */
test(
  "kesehatan: input KIA, ibu hamil, anak, lalu ekspor",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const posyanduNama = `Posyandu E2E ${cap}`;
    const noKia = `KIA-E2E-${cap}`;

    try {
      // --- Posyandu --------------------------------------------------------
      await app.open("/kesehatan/posyandu");
      await expect(screen.getByRole("heading", { name: "Posyandu" })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah Posyandu" }).tap();
      let dialog = screen.getByRole("dialog");
      await browser.locator('input[name="nama"]').fill(posyanduNama);
      await browser.locator('input[name="alamat"]').fill("Balai Dusun E2E");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText(posyanduNama)).toBeVisible();

      // --- KIA -------------------------------------------------------------
      await app.open("/kesehatan/kia");
      await expect(screen.getByRole("heading", { name: /Kesehatan Ibu dan Anak/ })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah KIA" }).tap();
      dialog = screen.getByRole("dialog");
      await browser.locator('input[name="noKia"]').fill(noKia);
      await dialog.getByRole("combobox").nth(0).tap();
      await screen
        .getByRole("option", { name: /Warga Uji E2E \(3201010101010001\)/ })
        .first()
        .tap();
      await browser.locator('input[name="hariPerkiraanLahir"]').fill("2026-12-01");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      await app.open("/kesehatan/kia");
      await expect(screen.getByText(noKia)).toBeVisible();

      // --- Ibu hamil -------------------------------------------------------
      await app.open("/kesehatan/pemantauan-ibu-hamil");
      await expect(screen.getByRole("heading", { name: "Pemantauan Ibu Hamil" })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah Pemantauan" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByRole("combobox").nth(0).tap();
      await screen.getByRole("option", { name: posyanduNama }).tap();
      await dialog.getByRole("combobox").nth(1).tap();
      await screen.getByRole("option", { name: new RegExp(noKia) }).tap();
      await dialog.getByRole("combobox").nth(2).tap();
      await screen.getByRole("option", { name: "Risiko Tinggi" }).tap();
      await browser.locator('input[name="usiaKehamilan"]').fill("24");
      await dialog.getByLabel("Pemeriksaan kehamilan").check();
      await dialog.getByLabel("Konsumsi pil Fe").check();
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      await app.open("/kesehatan/pemantauan-ibu-hamil");
      const barisIbu = screen.getByRole("row").filter({ hasText: noKia });
      await expect(barisIbu).toBeVisible();
      await expect(barisIbu.getByText("Risiko Tinggi")).toBeVisible();
      await expect(barisIbu.getByText("24")).toBeVisible();

      // --- Pemantauan anak -------------------------------------------------
      await app.open("/kesehatan/pemantauan-anak");
      await expect(screen.getByRole("heading", { name: /Pemantauan Anak/ })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah Pemantauan" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByRole("combobox").nth(0).tap();
      await screen.getByRole("option", { name: posyanduNama }).tap();
      await dialog.getByRole("combobox").nth(1).tap();
      await screen.getByRole("option", { name: new RegExp(noKia) }).tap();
      await browser.locator('input[name="umurBulan"]').fill("12");
      await dialog.getByRole("combobox").nth(2).tap();
      await screen.getByRole("option", { name: "Gizi Kurang" }).tap();
      await dialog.getByRole("combobox").nth(3).tap();
      await screen.getByRole("option", { name: "Kuning" }).tap();
      await browser.locator('input[name="beratBadan"]').fill("8.5");
      await browser.locator('input[name="tinggiBadan"]').fill("70");
      await dialog.getByLabel("Imunisasi dasar").check();
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      await app.open("/kesehatan/pemantauan-anak");
      const barisAnak = screen.getByRole("row").filter({ hasText: noKia });
      await expect(barisAnak).toBeVisible();
      await expect(barisAnak.getByText("12 bln")).toBeVisible();
      await expect(barisAnak.getByText("Gizi Kurang")).toBeVisible();
      await expect(barisAnak.getByText("Kuning")).toBeVisible();

      // --- Ekspor CSV ------------------------------------------------------
      const ekspor = await browser.evaluate(async () => {
        const hasil = [];
        for (const jalur of [
          "/kesehatan/kia/ekspor",
          "/kesehatan/ibu-hamil/ekspor",
          "/kesehatan/pemantauan-anak/ekspor",
        ]) {
          const res = await fetch(jalur);
          hasil.push({
            jalur,
            status: res.status,
            tipe: res.headers.get("content-type"),
            isi: await res.text(),
          });
        }
        return hasil;
      });

      for (const item of ekspor) {
        expect(item.status, item.jalur).toBe(200);
        expect(item.tipe, item.jalur).toContain("text/csv");
      }
      expect(ekspor[1]?.isi).toContain("Risiko Tinggi");
      expect(ekspor[1]?.isi).toContain("Ya");
      expect(ekspor[2]?.isi).toContain("Gizi Kurang");
      expect(ekspor[2]?.isi).toContain("8.5");
    } finally {
      await hapusKesehatanDariNoKia(noKia);
      await hapusPosyanduDariNama(posyanduNama);
    }
  },
);

/**
 * Katalog: OS-POP-008 — halaman publik KIA dan ekspor HTML tetap terbuka.
 */
test(
  "kesehatan publik: KIA, ibu hamil, dan anak tampil tanpa login",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    for (const [jalur, judul] of [
      ["/desa/kesehatan/kia", "Kesehatan Ibu dan Anak (KIA)"],
      ["/desa/kesehatan/ibu-hamil", "Pemantauan Ibu Hamil"],
      ["/desa/kesehatan/pemantauan-anak", "Pemantauan Anak"],
    ] as const) {
      await app.open(jalur);
      await expect(browser.locator("h1")).toContainText(judul);
      await expect(browser.locator("table")).toBeVisible();
    }
  },
);
