import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatSurveyPublikDariJudul,
  hapusSurveyDariJudul,
  nonaktifkanSurveyDariJudul,
} from "./support/database";

/**
 * Katalog: OS-ANA-006 — Halaman publik survei menampilkan survei aktif dan form isinya.
 */
test(
  "survei publik: survei aktif tampil di daftar dan bisa dibuka",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    const judul = `Survei Publik E2E ${Date.now()}`;
    await buatSurveyPublikDariJudul(judul);

    try {
      await app.open("/desa/analisis-survei");
      await expect(browser.locator("h1")).toContainText("Survei");
      await expect(screen.getByText(judul)).toBeVisible();

      await screen
        .getByRole("listitem")
        .filter({ hasText: judul })
        .getByRole("link", { name: "Isi Survei" })
        .tap();
      await expect(browser).toHaveURL(/\/desa\/analisis-survei\/\d+\/isi/);
      await expect(screen.getByLabel("Nama (Opsional)")).toBeVisible();
      await expect(screen.getByLabel("NIK (Opsional)")).toBeVisible();
      await expect(screen.getByRole("button", { name: "Kirim Jawaban" })).toBeVisible();
    } finally {
      await hapusSurveyDariJudul(judul);
    }
  },
);

/**
 * Katalog: OS-ANA-006 — Survei nonaktif tidak ditampilkan ke publik.
 */
test(
  "survei publik: survei nonaktif tidak tampil",
  { timeout: 60_000 },
  async ({ app, screen }) => {
    const judul = `Survei Nonaktif E2E ${Date.now()}`;
    await buatSurveyPublikDariJudul(judul);
    await nonaktifkanSurveyDariJudul(judul);

    try {
      await app.open("/desa/analisis-survei");
      await expect(screen.getByText(judul)).toHaveCount(0);
    } finally {
      await hapusSurveyDariJudul(judul);
    }
  },
);
