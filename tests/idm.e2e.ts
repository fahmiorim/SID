import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "idm admin loads with recap",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/desa/idm");
    await expect(browser).toHaveURL("/desa/idm");
    await expect(browser.locator("h1")).toContainText("Status Desa / IDM");
    await expect(browser.locator("body")).toContainText("Skor IDM");
  },
);

test(
  "idm admin create, edit, and delete indicator",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    const nama = `E2E Indikator ${Date.now()}`;

    await app.open("/desa/idm");
    await screen.getByRole("button", { name: "Tambah Indikator" }).tap();
    await screen.getByLabel("Kode").fill("I.9");
    await screen.getByLabel("Nama Indikator").fill(nama);
    await screen.getByLabel("Skor (0–100)").fill("80");
    await screen.getByRole("button", { name: "Simpan" }).tap();

    await expect(browser.locator("table")).toContainText(nama);
    await expect(browser.locator("body")).toContainText("0,800");

    await screen.getByRole("button", { name: "Ubah" }).first().tap();
    await screen.getByLabel("Skor (0–100)").fill("60");
    await screen.getByRole("button", { name: "Simpan" }).tap();
    await expect(browser.locator("table")).toContainText("60");

    await screen.getByRole("button", { name: "Hapus" }).first().tap();
    await expect(browser.locator("table")).not.toContainText(nama);
  },
);

test("sdgs admin fills a goal", { session: "admin" }, async ({ app, screen, browser }) => {
  await app.open("/desa/idm-sdgs");
  await expect(browser.locator("h1")).toContainText("Capaian SDGs Desa");

  await screen.getByRole("button", { name: "Isi" }).first().tap();
  await screen.getByLabel("Skor (0–100)").fill("75");
  await screen.getByLabel("Keterangan").fill("Diisi pengujian E2E");
  await screen.getByRole("button", { name: "Simpan" }).tap();

  await expect(browser.locator("table")).toContainText("75");
  await expect(browser.locator("body")).toContainText("0,750");
});

test(
  "idm sdgs public page loads without session",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/idm-sdgs");
    await expect(browser).toHaveURL("/desa/idm-sdgs");
    await expect(browser.locator("h1")).toContainText("Indeks Desa Membangun (IDM) & SDGs");
  },
);
