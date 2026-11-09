import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-WEB-016 — Tema: teks berjalan dan tautan sosial media disimpan
 * lalu tampil di situs publik; OS-WEB-017 — daftar tema terpasang terlihat.
 */
test(
  "OS-WEB-016/017 — tema: simpan teks berjalan + sosmed dan tampil di publik",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const teks = `Layanan darurat desa 24 jam — uji E2E ${Date.now()}`;
    const facebook = "https://facebook.com/desa-contoh-e2e";

    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: "Tema Situs" })).toBeVisible();
    await expect(screen.getByText("Tema terpasang")).toBeVisible();

    const asli = await browser.evaluate(() => {
      const teksEl = document.querySelector<HTMLTextAreaElement>("#teksBerjalan");
      const fbEl = document.querySelector<HTMLInputElement>("#sosmed_facebook");
      return { teks: teksEl?.value ?? "", facebook: fbEl?.value ?? "" };
    });

    try {
      await screen.getByLabel("Teks berjalan").fill(teks);
      await screen.getByLabel("Facebook").fill(facebook);
      await screen.getByRole("button", { name: "Simpan pengaturan tema" }).tap();

      await app.open("/konten/tema");
      await expect(screen.getByLabel("Teks berjalan")).toHaveValue(teks);
      await expect(screen.getByLabel("Facebook")).toHaveValue(facebook);

      // Nilai yang disimpan terpakai oleh tema publik.
      await app.open("/");
      await expect(screen.getByText(teks)).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByRole("link", { name: /facebook/i }).first()).toHaveAttribute(
        "href",
        facebook,
      );
    } finally {
      await app.open("/konten/tema");
      await screen.getByLabel("Teks berjalan").fill(asli.teks);
      await screen.getByLabel("Facebook").fill(asli.facebook);
      await screen.getByRole("button", { name: "Simpan pengaturan tema" }).tap();
    }
  },
);
