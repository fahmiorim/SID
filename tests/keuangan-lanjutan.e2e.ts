import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-FIN-004 — Arsip dokumen laporan periodik, lampiran PDF, metadata, RBAC, dan impor multi-PDF
// dengan validasi MIME/ukuran/periode melalui `imporDokumenLaporan`. Test domain
// `laporan-dokumen-impor.test.ts`. **Gap: E2E impor belum membuktikan hasil penyimpanan**;
// E2E di bawah memeriksa dialog impor dan metadata unggah PDF.
// ============================================================================
test(
  "arsip dokumen: dialog impor multi-PDF menampilkan validasi berkas",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/keuangan/laporan-dokumen");
    await screen.getByRole("button", { name: /impor dokumen/i }).tap();
    await expect(screen.getByRole("heading", { name: /impor dokumen laporan/i })).toBeVisible();
    // Form unggah hanya menerima PDF
    await expect(screen.getByLabel(/berkas pdf/i)).toBeVisible();
  },
);

test(
  "arsip dokumen: unggah PDF menampilkan metadata dan tombol impor",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/keuangan/laporan-dokumen");
    await screen.getByRole("button", { name: /impor dokumen/i }).tap();
    await expect(screen.getByRole("heading", { name: /impor dokumen laporan/i })).toBeVisible();
    await screen.page.setInputFiles('input[type="file"]', "tests/fixtures/berkas-uji-e2e.pdf");
    // Metadata baris muncul dan berkas lolos validasi PDF
    await expect(screen.getByText("OK", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(screen.getByRole("button", { name: /impor 1 berkas/i })).toBeVisible();
  },
);

// ============================================================================
// OS-FIN-006 — Transparansi APBDes dan laporan triwulan publik tersedia melalui `/desa/apbdes`,
// termasuk ringkasan per triwulan dan filter tahun; test `laporan-triwulan.test.ts`.
// **Gap: E2E filter periode dan data laporan belum dibuktikan**; E2E yang ada belum memeriksa perilaku tersebut.
// ============================================================================
test(
  "APBDes publik: halaman `/desa/apbdes` tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/apbdes");
    await expect(browser).toHaveURL("/desa/apbdes");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
  },
);

test("APBDes filter triwulan dan data laporan", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/apbdes");
  // Filter triwulan
  await expect(browser.locator('[name="triwulan"]')).toBeVisible({ timeout: 3000 });
  // Filter tahun
  await expect(browser.locator('[name="tahun"]')).toBeVisible({ timeout: 3000 });
  // Tombol ekspor
  await expect(browser.locator("text=/ekspor|download/i")).toBeVisible({ timeout: 3000 });
});
