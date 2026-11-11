import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatProgramBantuanDariNama, hapusProgramBantuanDariNama } from "./support/database";

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
 * Katalog: OS-POP-013 — Peserta program muncul di statistik dan ekspor
 * mengikuti filter sasaran yang dipilih lewat form.
 */
test(
  "statistik bantuan: peserta program dihitung dan ekspor mengikuti filter",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const nama = `Program Statistik E2E ${Date.now()}`;
    await buatProgramBantuanDariNama(nama);

    try {
      await app.open(`/bantuan?q=${encodeURIComponent(nama)}`);
      await screen.getByRole("button", { name: `Aksi untuk program ${nama}` }).tap();
      await screen.getByRole("menuitem", { name: "Peserta" }).tap();
      const dialogPeserta = screen.getByRole("dialog").filter({ hasText: "Peserta —" });
      await dialogPeserta.getByLabel("Penduduk").tap();
      await screen.getByRole("option").first().tap();
      await dialogPeserta.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("1 peserta terdaftar.")).toBeVisible({ timeout: 30_000 });
      await dialogPeserta.getByRole("button", { name: "Tutup dialog" }).tap();

      // Statistik per program menghitung peserta yang baru ditambahkan.
      await app.open("/statistik/bantuan");
      await expect(screen.getByRole("heading", { name: "Statistik Bantuan" })).toBeVisible();
      const barisProgram = screen.getByRole("row").filter({ hasText: nama });
      await expect(barisProgram).toBeVisible();
      await expect(barisProgram.getByRole("cell").nth(1)).toHaveText("1");

      // Ubah kategori lewat form, lalu pilih sasaran Penduduk.
      await browser.locator('select[name="kind"]').selectOption({ label: "Sasaran Bantuan" });
      await screen.getByRole("button", { name: "Tampilkan" }).tap();
      await expect(browser).toHaveURL(/kind=sasaran/);
      await browser.locator('select[name="sasaran"]').selectOption({ label: "Penduduk" });
      await screen.getByRole("button", { name: "Tampilkan" }).tap();
      await expect(browser).toHaveURL(/sasaran=1/);

      const barisPenduduk = screen.getByRole("row").filter({ hasText: "Penduduk" });
      await expect(barisPenduduk).toBeVisible();
      await expect(barisPenduduk.getByRole("cell").nth(1)).not.toHaveText("0");
      await expect(screen.getByRole("link", { name: "Ekspor CSV" })).toHaveAttribute(
        "href",
        /sasaran=1/,
      );
      await expect(screen.getByRole("link", { name: "Unduh PDF" })).toHaveAttribute(
        "href",
        /sasaran=1/,
      );

      const unduhan = await browser.evaluate(async () => {
        const csv = await fetch("/statistik/bantuan/ekspor?kind=sasaran&sasaran=1");
        const pdf = await fetch("/statistik/bantuan/ekspor/pdf?kind=sasaran&sasaran=1");
        return {
          csv: {
            status: csv.status,
            type: csv.headers.get("content-type") ?? "",
            body: await csv.text(),
          },
          pdf: { status: pdf.status, type: pdf.headers.get("content-type") ?? "" },
        };
      });
      expect(unduhan.csv.status).toBe(200);
      expect(unduhan.csv.type).toContain("text/csv");
      expect(unduhan.csv.body).toContain("Penduduk");
      expect(unduhan.csv.body).toContain("Total");
      expect(unduhan.pdf.status).toBe(200);
      expect(unduhan.pdf.type).toContain("application/pdf");
    } finally {
      await hapusProgramBantuanDariNama(nama);
    }
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
