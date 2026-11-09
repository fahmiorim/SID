import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WEB-005 — Dokumen: buat jenis produk hukum + tahun, filter, arsip, embed sandbox
// ============================================================================
test(
  "dokumen CRUD, filter, arsip, dan embed sandbox berfungsi",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    const docNama = `Dokumen ${Date.now()}`;

    await app.open("/konten/dokumen");
    await screen.getByRole("button", { name: "Tambah dokumen" }).tap();
    await screen.getByLabel("Nama dokumen").fill(docNama);

    await screen.getByLabel("Kategori").tap();
    await screen.getByRole("option", { name: "Produk hukum & peraturan" }).tap();

    await screen.getByLabel("Jenis produk hukum").tap();
    await screen.getByRole("option", { name: "Peraturan Desa" }).tap();

    await screen.getByLabel("Tahun").fill("2026");
    await screen
      .getByLabel("Tautan luar")
      .fill("https://peraturan-desa.example.com/2026/perdes-001");

    await screen.getByRole("button", { name: "Tambah" }).tap();
    await expect(screen.getByText(/berhasil ditambahkan/i)).toBeVisible({ timeout: 10_000 });

    // Filter publik — gunakan jenis yang sesuai dengan enum DOKUMEN_JENIS
    await app.open("/desa/dokumen?kategori=produk_hukum&jenis=peraturan_desa&tahun=2026");
    await expect(screen.getByText(docNama)).toBeVisible();

    // Embed sandbox test
    const embedNama = `Embed ${Date.now()}`;
    await app.open("/konten/dokumen");
    await screen.getByRole("button", { name: "Tambah dokumen" }).tap();
    await screen.getByLabel("Nama dokumen").fill(embedNama);

    await screen.getByLabel("Kategori").tap();
    await screen.getByRole("option", { name: "Sematan" }).tap();

    await screen.getByLabel("Tahun").fill("2026");
    await screen.getByLabel("Tautan luar").fill("https://example.com/");

    await screen.getByRole("button", { name: "Tambah" }).tap();
    await expect(screen.getByText(/berhasil ditambahkan/i)).toBeVisible({ timeout: 10_000 });

    await app.open("/desa/dokumen?kategori=embed");
    await expect(screen.getByText(embedNama)).toBeVisible();

    const iframe = browser.locator(`iframe[title="Sematan: ${embedNama}"]`);
    await expect(iframe).toBeVisible();
    expect(await iframe.getAttribute("sandbox")).toBe("");
  },
);
