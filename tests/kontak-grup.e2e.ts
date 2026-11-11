import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  hapusGrupKontakDariNama,
  hapusKontakDariNama,
  pendudukBernikUji,
} from "./support/database";

/**
 * Katalog: OS-POP-015 — Daftar kontak dan grup kontak.
 *
 * Alur yang dibuktikan: NIK 16 digit dipakai untuk mencari penduduk dan
 * mengisi nama, kontak baru muncul dengan tautan telepon/email/Telegram,
 * kontak dapat diubah, ekspor CSV memuat data terbaru, grup dibuat dan diberi
 * anggota, lalu anggota/kontak/grup dihapus lewat UI.
 */
test(
  "kontak: lookup NIK, CRUD, grup anggota, ekspor, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const namaKontak = `Kontak E2E ${cap}`;
    const namaGrup = `Grup Kontak E2E ${cap}`;
    const telepon = `08${String(cap).slice(-10)}`;
    const teleponBaru = `08${String(cap).slice(-10)}9`;
    const email = `kontak-${cap}@contoh.test`;
    const telegram = `@e2e_${String(cap).slice(-8)}`;
    const penduduk = await pendudukBernikUji(1);

    if (penduduk.length === 0) {
      throw new Error("E2E kontak membutuhkan minimal satu penduduk ber-NIK.");
    }

    const sasaran = penduduk[0]!;

    try {
      // 1. Lookup NIK mengembalikan penduduk yang sama.
      await app.open("/hubung-warga/daftar-kontak");
      await expect(screen.getByRole("heading", { name: "Daftar Kontak" })).toBeVisible();

      const lookup = await browser.evaluate(async (nik: string) => {
        const res = await fetch(`/api/penduduk/nik?nik=${nik}`);
        return { status: res.status, body: await res.json() };
      }, sasaran.nik);
      expect(lookup.status).toBe(200);
      expect(lookup.body.ok).toBe(true);
      expect(Number(lookup.body.resident.id)).toBe(sasaran.id);

      // 2. Tambah kontak; blur NIK mengisi nama penduduk secara otomatis.
      await screen.getByRole("button", { name: "Tambah Kontak" }).tap();
      const dialogTambah = screen.getByRole("dialog");
      await browser.locator('[role="dialog"] input[name="residentId"]').fill(sasaran.nik);
      await browser.locator('[role="dialog"] input[name="telepon"]').click();
      await expect(browser.locator('[role="dialog"] input[name="nama"]')).toHaveValue(
        sasaran.nama,
        {
          timeout: 15_000,
        },
      );

      await browser.locator('[role="dialog"] input[name="nama"]').fill(namaKontak);
      await browser.locator('[role="dialog"] input[name="telepon"]').fill(telepon);
      await browser.locator('[role="dialog"] input[name="email"]').fill(email);
      await browser.locator('[role="dialog"] input[name="telegram"]').fill(telegram);
      await browser
        .locator('[role="dialog"] textarea[name="keterangan"]')
        .fill("Kontak dibuat oleh E2E");
      await dialogTambah.getByRole("button", { name: "Simpan" }).tap();
      await expect(dialogTambah).not.toBeVisible({ timeout: 15_000 });

      const baris = screen.getByRole("row").filter({ hasText: namaKontak });
      await expect(baris).toBeVisible();
      await expect(baris.getByRole("link", { name: telepon })).toHaveAttribute(
        "href",
        `tel:${telepon}`,
      );
      await expect(baris.getByRole("link", { name: email })).toHaveAttribute(
        "href",
        `mailto:${email}`,
      );
      await expect(baris.getByRole("link", { name: telegram })).toHaveAttribute(
        "href",
        `https://t.me/${telegram.slice(1)}`,
      );
      await expect(baris).toContainText(String(sasaran.id));

      // 3. Ubah telepon dan pastikan tautan serta data tabel ikut berubah.
      await baris.getByRole("button", { name: "Ubah" }).tap();
      const dialogUbah = screen.getByRole("dialog");
      await browser.locator('[role="dialog"] input[name="telepon"]').fill(teleponBaru);
      await dialogUbah.getByRole("button", { name: "Simpan" }).tap();
      await expect(dialogUbah).not.toBeVisible({ timeout: 15_000 });
      await expect(baris.getByRole("link", { name: teleponBaru })).toHaveAttribute(
        "href",
        `tel:${teleponBaru}`,
      );

      // 4. Ekspor CSV memuat kontak hasil ubah.
      const csv = await browser.evaluate(async () => {
        const res = await fetch("/hubung-warga/daftar-kontak/ekspor");
        return {
          status: res.status,
          type: res.headers.get("content-type") ?? "",
          body: await res.text(),
        };
      });
      expect(csv.status).toBe(200);
      expect(csv.type).toContain("text/csv");
      expect(csv.body).toContain(namaKontak);
      expect(csv.body).toContain(teleponBaru);
      expect(csv.body).toContain(email);
      expect(csv.body).toContain(String(sasaran.id));

      // 5. Buat grup dan tambahkan kontak sebagai anggota.
      await app.open("/hubung-warga/grup-kontak");
      await expect(screen.getByRole("heading", { name: "Grup Kontak" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Grup" }).tap();
      const dialogGrup = screen.getByRole("dialog");
      await browser.locator('[role="dialog"] input[name="namaGrup"]').fill(namaGrup);
      await browser
        .locator('[role="dialog"] textarea[name="keterangan"]')
        .fill("Grup dibuat oleh E2E");
      await dialogGrup.getByRole("button", { name: "Simpan" }).tap();
      await expect(dialogGrup).not.toBeVisible({ timeout: 15_000 });

      const barisGrup = screen.getByRole("row").filter({ hasText: namaGrup });
      await expect(barisGrup).toBeVisible();
      await barisGrup.getByRole("button", { name: "Anggota" }).tap();

      const dialogAnggota = screen.getByRole("dialog");
      await expect(
        dialogAnggota.getByRole("heading", { name: `Anggota — ${namaGrup}` }),
      ).toBeVisible();
      await expect(dialogAnggota.getByText("Belum ada anggota.")).toBeVisible();

      await dialogAnggota.getByRole("combobox").tap();
      await screen.getByRole("option", { name: namaKontak }).tap();
      await dialogAnggota.getByRole("button", { name: "Tambah" }).tap();

      const barisAnggota = dialogAnggota.getByRole("row").filter({ hasText: namaKontak });
      await expect(barisAnggota).toBeVisible({ timeout: 15_000 });
      await expect(barisAnggota).toContainText(teleponBaru);

      // 6. Hapus anggota, lalu hapus grup dan kontak dengan konfirmasi native.
      await barisAnggota.getByRole("button", { name: "Hapus" }).tap();
      await expect(dialogAnggota.getByText("Belum ada anggota.")).toBeVisible({
        timeout: 15_000,
      });
      await dialogAnggota.getByRole("button", { name: "Tutup dialog" }).tap();

      const lepasDialogGrup = await browser.onDialog("accept");
      await barisGrup.getByRole("button", { name: "Hapus" }).tap();
      await expect(barisGrup).toHaveCount(0, { timeout: 15_000 });
      await lepasDialogGrup();

      await app.open("/hubung-warga/daftar-kontak");
      const barisHapus = screen.getByRole("row").filter({ hasText: namaKontak });
      const lepasDialogKontak = await browser.onDialog("accept");
      await barisHapus.getByRole("button", { name: "Hapus" }).tap();
      await expect(barisHapus).toHaveCount(0, { timeout: 15_000 });
      await lepasDialogKontak();

      await expect(screen.getByText("Belum ada kontak.")).toBeVisible();
    } finally {
      await hapusGrupKontakDariNama(namaGrup);
      await hapusKontakDariNama(namaKontak);
    }
  },
);
