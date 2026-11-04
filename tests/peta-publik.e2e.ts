import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-WIL-005/007.
test(
  "halaman peta desa publik dapat diakses",
  { tags: ["smoke"] },
  async ({ app, browser, screen }) => {
    await app.open("/desa/peta");
    await expect(browser).toHaveURL("/desa/peta");
    await expect(browser.locator("body")).toBeVisible();
    await expect(screen.getByRole("heading", { name: /Peta Desa/i })).toBeVisible();
  },
);
