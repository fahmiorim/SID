import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatPemilihanDenganKandidat, hapusPemilihanDariJenis } from "./support/database";

/**
 * Katalog: OS-GOV-007 — Admin membuat pemilihan desa.
 */
test(
  "pemilihan admin: buat pemilihan dan tampil di tabel",
  { session: "admin" },
  async ({ app, screen }) => {
    const jenis = `Pemilihan E2E ${Date.now()}`;

    try {
      await app.open("/pemerintahan/pemilihan");
      await expect(screen.getByRole("heading", { name: /pemilihan/i })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Pemilihan" }).tap();
      await expect(screen.getByRole("dialog")).toBeVisible();
      await screen.getByLabel("Jenis", { exact: true }).fill(jenis);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByRole("cell", { name: jenis })).toBeVisible();
    } finally {
      await hapusPemilihanDariJenis(jenis);
    }
  },
);

/**
 * Katalog: OS-GOV-007 — Publik melihat kandidat, suara, dan pemenang.
 */
test("pemilihan publik: kandidat dan rekap suara ditampilkan", async ({ app, screen, browser }) => {
  const jenis = `Pemilihan Publik E2E ${Date.now()}`;
  const { kandidat } = await buatPemilihanDenganKandidat(jenis);

  try {
    await app.open("/desa/pemilihan");
    await expect(browser.locator("h1")).toContainText("Pemilihan Desa");
    await expect(screen.getByText(new RegExp(jenis)).first()).toBeVisible();
    await expect(screen.getByText(kandidat[0])).toBeVisible();
    await expect(screen.getByText(kandidat[1])).toBeVisible();
    await expect(screen.getByText(/Total suara sah: 10/)).toBeVisible();
    await expect(screen.getByText(new RegExp(`Pemenang: ${kandidat[0]}`))).toBeVisible();
  } finally {
    await hapusPemilihanDariJenis(jenis);
  }
});
