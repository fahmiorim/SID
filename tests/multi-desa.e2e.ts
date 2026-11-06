import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Uji end-to-end fitur multi-desa (Fase 5).
 *
 * Asumsi: instalasi uji berisi minimal satu desa dengan role super admin.
 * Kredensial admin desa tersedia lewat `credentials.user("admin")`.
 * Super admin belum punya seed khusus, jadi test ini mengandalkan halaman
 * /super-admin dapat diakses setelah login sebagai administrator.
 */

test(
  "halaman super-admin dapat dibuka oleh admin",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/super-admin");
    await expect(browser).toHaveURL("/super-admin");
    await expect(browser.locator("h1")).toContainText("Super Admin — Multi-Desa");
  },
);

test(
  "daftar desa menampilkan kolom status dan kuota",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/super-admin");
    await expect(browser.locator("table")).toBeVisible();
    const header = await browser.locator("thead tr").innerText();
    expect(header).toContain("Status");
    expect(header).toContain("Kuota media");
  },
);

test(
  "toolbar kelola desa tersedia di setiap baris",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/super-admin");
    // TombolMoreHorizontal dipakai KelolaDesaToolbar.
    const buttons = await browser.locator('button[title="Kelola desa"]');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  },
);
