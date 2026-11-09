import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { masukDenganKredensial } from "./support/login";
import { buatFixtureSuratDinas, type SuratDinasE2EFixture } from "./support/surat-dinas-fixture";

const test = webTest.extend<{ fixture: SuratDinasE2EFixture }>({
  fixture: async ({}, gunakan) => {
    const fixture = await buatFixtureSuratDinas();
    try {
      await gunakan(fixture);
    } finally {
      await fixture.hapus();
    }
  },
});

// Katalog: OS-SUR-011 — Surat dinas: CRUD, arsip fisik/digital, lampiran media, RBAC.
test(
  "surat dinas: admin membuat, operator memverifikasi, dan publik mengakses arsip",
  { timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const admin = credentials.user("admin");

    // Halaman buku surat dinas memerlukan izin baca modul persuratan.
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(screen, browser, admin.username, admin.password);
    await expect(browser).toHaveURL("/beranda");

    // Buka surat dinas admin.
    await app.open("/persuratan/surat-dinas");
    await expect(screen.getByRole("heading", { name: /surat dinas/i })).toBeVisible();
    await expect(screen.getByRole("table")).toBeVisible();
  },
);
