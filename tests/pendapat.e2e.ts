import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("pendapat admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pendapat");
  await expect(browser).toHaveURL("/pendapat");
  await expect(browser.locator("h1")).toContainText("Pendapat Warga");
});

test("pendapat publik submit", { tags: ["smoke"] }, async ({ app, screen, browser }) => {
  await app.open("/jajak-pendapat");
  await expect(browser).toHaveURL("/jajak-pendapat");

  await screen.getByPlaceholder("Nama atau inisial").fill("E2E Warga");
  await screen.getByRole("radio", "Puas").tap();
  await screen.getByRole("button", "Kirim Pendapat").tap();

  await expect(browser).toHaveURL("/jajak-pendapat");
});

test("pendapat admin export page loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pendapat");
  await expect(browser).toHaveURL("/pendapat");
  await expect(browser.locator("body")).toBeVisible();
});

test("pendapat publik voting flow", { tags: ["smoke"] }, async ({ app, screen, browser }) => {
  await app.open("/jajak-pendapat");
  await expect(browser).toHaveURL("/jajak-pendapat");
  await screen.getByPlaceholder("Nama atau inisial").fill("E2E Tester");
  await screen.getByRole("radio", "Sangat Puas").tap();
  await screen.getByRole("button", "Kirim Pendapat").tap();
  await expect(browser.locator("body")).toBeVisible();
});
