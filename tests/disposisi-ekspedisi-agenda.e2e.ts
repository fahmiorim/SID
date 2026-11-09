import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { masukDenganKredensial } from "./support/login";
import {
  buatFixturePermohonanWarga,
  type PermohonanWargaFixture,
} from "./support/permohonan-warga-fixture";

const test = webTest.extend<{ alur: PermohonanWargaFixture }>({
  alur: async ({}, gunakan) => {
    const alur = await buatFixturePermohonanWarga();
    try {
      await gunakan(alur);
    } finally {
      await alur.hapus();
    }
  },
});

// Katalog: OS-SUR-009/010/012.
test(
  "operator dapat menambahkan disposisi surat masuk dan ekspedisi surat keluar",
  { timeout: 180_000 },
  async ({ app, screen, browser }) => {
    await app.clearState();
    await app.open("/masuk");
    const admin = credentials.user("admin");
    await masukDenganKredensial(screen, browser, admin.username, admin.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/persuratan/surat-masuk");
    await expect(screen.getByRole("heading", { name: /surat masuk/i })).toBeVisible();
    await app.open("/persuratan/surat-keluar");
    await expect(screen.getByRole("heading", { name: /surat keluar/i })).toBeVisible();
  },
);
