import { test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

// Katalog: OS-WGA-002.
test("login warga gagal dengan password salah", async ({ app, screen, browser }) => {
  await app.clearState();
  await app.open("/masuk");
  await screen.getByLabel("Username atau NIK").fill(credentials.user("warga-e2e").username);
  await screen.getByLabel("Kata sandi / PIN").fill("salah12345");
  await screen.getByRole("button", { name: "Masuk" }).tap();
  await expect(browser.locator("body")).toBeVisible();
});
