import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "sinergi admin loads with table",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/desa/sinergi");
    await expect(browser).toHaveURL("/desa/sinergi");
    await expect(browser.locator("h1")).toContainText("Sinergi Program");
    await expect(browser.locator("table")).toBeVisible();
  },
);

test(
  "sinergi admin create and delete program",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    const nama = `E2E Sinergi ${Date.now()}`;

    await app.open("/desa/sinergi");
    await screen.getByRole("button", { name: "Tambah program" }).tap();
    await screen.getByLabel("Nama program").fill(nama);
    await screen.getByLabel("Mitra / pihak").fill("Mitra E2E");
    await screen.getByLabel("Keterangan").fill("Dibuat oleh pengujian E2E");
    await screen.getByRole("button", { name: "Simpan program" }).tap();

    await expect(browser.locator("table")).toContainText(nama);

    await screen.getByRole("button", { name: `Aksi program ${nama}` }).tap();
    await screen.getByRole("menuitem", { name: "Hapus" }).tap();
    await screen.getByRole("button", { name: "Hapus" }).tap();

    await expect(browser.locator("table")).not.toContainText(nama);
  },
);

test("sinergi export CSV returns header", { session: "admin" }, async ({ app, browser }) => {
  // Rute ekspor mengirim `Content-Disposition: attachment`, sehingga navigasi
  // halaman berakhir di unduhan. Ambil isinya lewat fetch agar tetap teruji.
  await app.open("/desa/sinergi");

  const hasil = await browser.evaluate(async () => {
    const res = await fetch("/desa/sinergi/ekspor");
    return { status: res.status, teks: await res.text() };
  });

  expect(hasil.status).toBe(200);
  expect(hasil.teks).toContain("Nama Program");
});

test("sinergi publik loads without session", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/sinergi-program");
  await expect(browser).toHaveURL("/desa/sinergi-program");
  await expect(browser.locator("body")).toContainText("Sinergi Program");
});
