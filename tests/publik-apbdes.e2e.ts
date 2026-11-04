import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-FIN-006, OS-WEB-012/013.
test("halaman APBDes publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/apbdes");
  await expect(browser).toHaveURL("/desa/apbdes");
  await expect(browser.locator("body")).toBeVisible();
});
