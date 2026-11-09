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

/**
 * Katalog: OS-WGA-008 — Bantuan yang diterima warga.
 *
 * Warga masuk, membuka menu Bantuan dari beranda, lalu hanya melihat program
 * yang menautkannya sebagai peserta: program aktif dan selesai tampil dengan
 * status masing-masing, sedangkan program tanpa peserta tidak bocor.
 */
test(
  "warga membuka menu Bantuan dan hanya melihat program yang menautkannya",
  { timeout: 120_000 },
  async ({ app, screen, browser, bantuan }) => {
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      bantuan.wargaNik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await screen.getByRole("link", { name: "Bantuan" }).tap();
    await expect(browser).toHaveURL("/layanan-mandiri/bantuan");
    await expect(screen.getByRole("heading", { name: "Bantuan yang Diterima" })).toBeVisible();

    // Program yang menautkan warga tampil, lengkap dengan status masa aktif.
    await expect(screen.getByText(bantuan.namaBantuan)).toBeVisible();
    await expect(screen.getByText(bantuan.namaBantuanSelesai)).toBeVisible();
    await expect(screen.getByText("Program bantuan untuk verifikasi E2E.")).toBeVisible();
    await expect(screen.getByText("Program bantuan yang sudah selesai.")).toBeVisible();
    await expect(screen.getByText("Aktif")).toBeVisible();
    await expect(screen.getByText("Selesai")).toBeVisible();
    await expect(screen.getByText("Penduduk").first()).toBeVisible();

    // Program yang tidak menautkan warga ini tidak ikut tampil.
    await expect(screen.getByText(bantuan.namaBantuanLain)).toHaveCount(0);
  },
);
