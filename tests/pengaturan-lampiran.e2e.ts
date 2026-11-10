import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { bacaPengaturanLampiranUji, pulihkanPengaturanLampiranUji } from "./support/database";

/**
 * Pengaturan lampiran berkas per kategori (pengganti konstanta MIME/ukuran
 * hardcoded, tidak punya ID katalog OpenSID): override tersimpan, terbaca ulang,
 * dan Reset mengembalikan nilai default tanpa memuat ulang halaman penuh.
 */
test(
  "pengaturan lampiran: ubah lalu reset tanpa memuat ulang halaman",
  { session: "admin", timeout: 90_000 },
  async ({ app, screen, browser }) => {
    const kategori = "galeri";
    const awal = await bacaPengaturanLampiranUji(kategori);

    try {
      await app.open("/pengaturan/lampiran");
      await expect(screen.getByRole("heading", { name: "Pengaturan Lampiran" })).toBeVisible();
      const baris = screen.getByRole("row").filter({ hasText: "Galeri" }).first();
      await expect(baris).toBeVisible();

      await baris.getByRole("button", { name: "Atur" }).tap();
      const dialog = screen.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Pengaturan: Galeri" })).toBeVisible();
      await dialog.getByLabel("Jumlah File Maksimal").fill("2");
      await dialog.getByRole("button", { name: "Simpan" }).tap();
      await expect(screen.getByText('Pengaturan "galeri" berhasil disimpan.')).toBeVisible({
        timeout: 15_000,
      });

      // Override benar-benar tersimpan dan terbaca ulang dari server.
      await app.open("/pengaturan/lampiran");
      const tersimpan = screen.getByRole("row").filter({ hasText: "Galeri" }).first();
      await expect(tersimpan.getByText("(disesuaikan)")).toBeVisible();
      await expect(tersimpan.getByRole("cell", { name: "2", exact: true })).toBeVisible();

      // Penanda `window` hanya bertahan bila hidrasi tidak dibuang; Reset harus
      // memakai router.refresh(), bukan window.location.reload().
      await browser.evaluate(() => {
        (window as unknown as { __penandaE2E?: string }).__penandaE2E = "tetap";
      });
      await tersimpan.getByRole("button", { name: "Reset" }).tap();
      await expect(
        screen.getByText('Pengaturan "galeri" berhasil dikembalikan ke default.'),
      ).toBeVisible({ timeout: 15_000 });
      await expect(tersimpan.getByText("(disesuaikan)")).not.toBeVisible({ timeout: 10_000 });
      await expect(tersimpan.getByRole("cell", { name: "10", exact: true })).toBeVisible();

      const penanda = await browser.evaluate(
        () => (window as unknown as { __penandaE2E?: string }).__penandaE2E ?? null,
      );
      expect(penanda).toBe("tetap");
    } finally {
      await pulihkanPengaturanLampiranUji(kategori, awal);
    }
  },
);
