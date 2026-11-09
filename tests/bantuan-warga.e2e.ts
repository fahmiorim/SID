import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { buatFixtureBantuanWarga, type BantuanWargaFixture } from "./support/bantuan-warga-fixture";
import { masukDenganKredensial } from "./support/login";

const test = webTest.extend<{ bantuan: BantuanWargaFixture }>({
  bantuan: async ({}, gunakan) => {
    const fixture = await buatFixtureBantuanWarga();
    try {
      await gunakan(fixture);
    } finally {
      await fixture.hapus();
    }
  },
});

// Katalog: OS-WGA-008.
test(
  "warga melihat program bantuan yang tercatat untuk dirinya",
  { timeout: 120_000 },
  async ({ app, screen, browser, bantuan }) => {
    await app.open("/layanan-mandiri/bantuan");
    await expect(browser).toHaveURL(/\/masuk/);

    await masukDenganKredensial(
      screen,
      browser,
      bantuan.wargaNik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/bantuan");
    await expect(screen.getByRole("link", { name: "Bantuan" })).toBeVisible();
    await expect(screen.getByRole("heading", { name: "Bantuan yang Diterima" })).toBeVisible();
    await expect(screen.getByText(bantuan.namaBantuan)).toBeVisible();
    await expect(screen.getByText("Program bantuan untuk verifikasi E2E.")).toBeVisible();
    await expect(screen.getByText("Aktif")).toBeVisible();
  },
);
