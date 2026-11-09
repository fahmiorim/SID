import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-GOV-009 — Pembangunan: CRUD proyek + buku pembangunan + ekspor CSV.
// ============================================================================
test(
  "pembangunan: halaman buku pembangunan daftar proyek per tahun",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pembangunan/buku");
    await expect(screen.getByRole("heading", { name: /buku pembangunan/i })).toBeVisible();

    // Filter tahun tersedia
    await expect(screen.getByRole("link", { name: /semua tahun/i })).toBeVisible();
    // Jika tidak ada data, biasanya ada teks "Belum ada data" atau tabel dengan header
    const table = screen.getByRole("table");
    if (await table.count()) {
      await expect(table).toBeVisible();
    } else {
      await expect(screen.getByText(/belum ada proyek pembangunan/i)).toBeVisible();
    }
  },
);

test(
  "pembangunan: ekspor CSV buku pembangunan",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/pembangunan/buku");

    const contentType = await browser.evaluate(async () => {
      const res = await fetch("/pembangunan/buku/ekspor");
      return res.headers.get("content-type");
    });

    expect(contentType).toContain("text/csv");
  },
);
