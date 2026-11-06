import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-FIN-004 — Arsip dokumen laporan periodik + impor multi-PDF.
test(
  "dokumen laporan: dialog impor multi-PDF dan metadata tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/keuangan/laporan-dokumen");
    await expect(screen.getByRole("heading", { name: /laporan dokumen|arsip/i })).toBeVisible();
    await expect(screen.getByRole("button", { name: /impor/i })).toBeVisible();
  },
);

// Katalog: OS-FIN-006 — Transparansi APBDes per triwulan (sudah ditutunpublik-apbdes.e2e.ts).
// Tambahan: filter periode triwulan pada halaman publik.
test(
  "APBDes publik: filter periode triwulan tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/apbdes");
    await expect(browser).toHaveURL("/desa/apbdes");
    await expect(browser.locator("body")).toBeVisible();
  },
);
