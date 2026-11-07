import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-GOV-009 — Pembangunan: CRUD proyek + buku pembangunan + ekspor CSV.
// **Buku pembangunan** `/pembangunan/buku` (rekap per tahun: jumlah proyek per status,
// total anggaran, progres rata-rata, rincian proyek, siap cetak) + ekspor CSV `/pembangunan/buku/ekspor`;
// domain `buku-pembangunan.ts` + 8 test. **Gap: E2E buku pembangunan belum ada**.
// ============================================================================
test(
  "pembangunan: halaman buku pembangunan daftar proyek per tahun",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pembangunan/buku");
    await expect(screen.getByRole("heading", { name: /buku pembangunan/i })).toBeVisible();
    // Filter tahun
    await expect(screen.getByLabel(/tahun/i)).toBeVisible();
    // Daftar proyek per status
    await expect(screen.locator("text=/aktif|selesai|draft/i")).toBeVisible({ timeout: 5000 });
  },
);

test(
  "pembangunan: ekspor CSV buku pembangunan",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/pembangunan/buku/ekspor");
    await expect(browser).toHaveURL("/pembangunan/buku/ekspor");
    // Cek header CSV atau konten
    const csvContent = await browser.locator("pre, code, textarea").textContent();
    expect(csvContent).toContain("proyek");
    expect(csvContent).toContain("status");
    expect(csvContent).toContain("anggaran");
  },
);
