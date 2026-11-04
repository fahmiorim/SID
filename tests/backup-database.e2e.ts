import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-OPS-007.
test(
  "pengaturan database menampilkan opsi backup",
  { session: "admin" },
  async ({ app, browser, screen }) => {
    await app.open("/pengaturan/database");
    await expect(browser).toHaveURL("/pengaturan/database");
    await expect(screen.getByRole("heading", { name: /Pengaturan Database/i })).toBeVisible();
  },
);
