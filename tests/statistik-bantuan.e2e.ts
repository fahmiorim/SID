import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-POP-010 — Statistik penduduk: filter umur dan wilayah.
 */
test(
  "statistik penduduk: filter umur diterapkan lewat form",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/statistik/penduduk");
    await expect(browser.locator("h1")).toContainText("Statistik");

    await screen.getByLabel("Umur minimal").fill("20");
    await screen.getByLabel("Umur maksimal").fill("40");
    await screen.getByRole("button", { name: "Tampilkan" }).tap();

    await expect(browser).toHaveURL(/umurMin=20/);
    await expect(browser).toHaveURL(/umurMax=40/);
    await expect(screen.getByRole("button", { name: "Tampilkan" })).toBeVisible();
  },
);

/**
 * Katalog: OS-POP-013 — Statistik bantuan: filter kategori sasaran diteruskan ke ekspor.
 */
test(
  "statistik bantuan: filter sasaran tersaring ke tautan ekspor",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/statistik/bantuan?kind=sasaran&sasaran=1");
    await expect(browser.locator("h1")).toContainText("Statistik");
    await expect(screen.getByLabel("Saring jenis sasaran")).toHaveValue("1");

    await browser.locator('select[name="sasaran"]').selectOption({ label: "Keluarga (KK)" });
    await screen.getByRole("button", { name: "Tampilkan" }).tap();
    await expect(browser).toHaveURL(/sasaran=2/);

    const csvHref = await screen.getByRole("link", { name: /Ekspor CSV/ }).getAttribute("href");
    const pdfHref = await screen.getByRole("link", { name: /Unduh PDF/ }).getAttribute("href");
    expect(csvHref).toContain("/statistik/bantuan/ekspor?");
    expect(csvHref).toContain("sasaran=2");
    expect(pdfHref).toContain("/statistik/bantuan/ekspor/pdf?");
    expect(pdfHref).toContain("sasaran=2");
  },
);

/**
 * Katalog: OS-POP-010/013 — Ekspor CSV statistik mengembalikan text/csv.
 */
test(
  "ekspor CSV statistik penduduk dan bantuan",
  { session: "admin", timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");

    const hasil = await browser.evaluate(async () => {
      const penduduk = await fetch("/statistik/penduduk/ekspor?kind=umur");
      const bantuan = await fetch("/statistik/bantuan/ekspor?kind=sasaran&sasaran=1");
      return {
        penduduk: {
          status: penduduk.status,
          type: penduduk.headers.get("content-type"),
          body: await penduduk.text(),
        },
        bantuan: {
          status: bantuan.status,
          type: bantuan.headers.get("content-type"),
          body: await bantuan.text(),
        },
      };
    });

    expect(hasil.penduduk.status).toBe(200);
    expect(hasil.penduduk.type).toContain("text/csv");
    expect(hasil.bantuan.status).toBe(200);
    expect(hasil.bantuan.type).toContain("text/csv");
  },
);
