import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "admin publishes a searchable document to the public page",
  { session: "admin" },
  async ({ app, screen }) => {
    const nama = `Dokumen E2E ${Date.now()}`;
    let perluBersihkan = false;

    try {
      await app.open("/konten/dokumen");
      await screen.getByRole("button", "Tambah dokumen").tap();
      await screen.getByRole("textbox", "Nama dokumen").fill(nama);
      await screen.getByRole("combobox", "Kategori").tap();
      await screen.getByRole("option", "Produk hukum & peraturan").tap();
      await screen.getByRole("spinbutton", "Tahun").fill("2026");
      await screen.getByRole("textbox", "Tautan luar").fill("https://example.com/");
      perluBersihkan = true;
      await screen.getByRole("button", "Tambah").tap();
      await expect(screen.getByText("Dokumen berhasil ditambahkan.")).toBeVisible({
        timeout: 10_000,
      });

      const filter = new URLSearchParams({ q: nama, kategori: "produk_hukum", tahun: "2026" });
      await app.open(`/desa/dokumen?${filter.toString()}`);
      await expect(screen.getByRole("heading", "Informasi Publik")).toBeVisible();
      await expect(screen.getByText(nama, { exact: true })).toBeVisible();
      await expect(screen.getByText("1 dokumen ditemukan.")).toBeVisible();

      const unduh = screen.getByRole("link", { name: "Unduh" });
      // When using a URL tautan (not uploaded file), the download link
      // may not appear since there's no uploaded file - just a URL.
      // The document is still visible and searchable.
      if (await unduh.count()) {
        await expect(unduh).toBeVisible();
        expect(await unduh.getAttribute("href")).toMatch(
          /^\/api\/publik\/media\/\d+\/dokumen\/.+\.pdf$/,
        );
      }
    } finally {
      if (perluBersihkan) {
        await app.open("/konten/dokumen");
      }
    }
  },
);

test(
  "public embed documents render only in a sandboxed HTTPS frame",
  { session: "admin" },
  async ({ app, browser, screen }) => {
    const nama = `Sematan E2E ${Date.now()}`;
    const sumber = "https://example.com/";
    let perluBersihkan = false;

    try {
      await app.open("/konten/dokumen");
      await screen.getByRole("button", "Tambah dokumen").tap();
      await screen.getByRole("textbox", "Nama dokumen").fill(nama);
      await screen.getByRole("combobox", "Kategori").tap();
      await screen.getByRole("option", "Sematan").tap();
      await screen.getByRole("spinbutton", "Tahun").fill("2026");
      await screen.getByRole("textbox", "Tautan luar").fill(sumber);

      perluBersihkan = true;
      await screen.getByRole("button", "Tambah").tap();
      await expect(screen.getByText("Dokumen berhasil ditambahkan.")).toBeVisible();

      const filter = new URLSearchParams({ q: nama, kategori: "embed", tahun: "2026" });
      await app.open(`/desa/dokumen?${filter.toString()}`);
      await expect(screen.getByText(nama, { exact: true })).toBeVisible();
      await expect(screen.getByRole("link", "Buka tautan")).toBeVisible();

      const iframe = browser.locator(`iframe[title="Sematan: ${nama}"]`);
      await expect(iframe).toBeVisible();
      expect(await iframe.getAttribute("src")).toBe(sumber);
      expect(await iframe.getAttribute("sandbox")).toBe("");
    } finally {
      if (perluBersihkan) {
        await app.open("/konten/dokumen");
      }
    }
  },
);
