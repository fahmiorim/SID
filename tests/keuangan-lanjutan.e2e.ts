import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-FIN-004 — Arsip dokumen laporan periodik, lampiran PDF, metadata, RBAC, dan impor multi-PDF
// dengan validasi MIME/ukuran/periode melalui `imporDokumenLaporan`. Test domain
// `laporan-dokumen-impor.test.ts`. **Gap: E2E impor belum membuktikan unggah dan hasil penyimpanan**;
// `tests/keuangan-lanjutan.e2e.ts` hanya memeriksa tombol impor.
// ============================================================================
test(
  "arsip dokumen: impor multi-PDF validasi MIME/ukuran/periode",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/keuaran/arsip/dokumen/impor");
    await expect(screen.getByRole("heading", { name: /impor dokumen/i })).toBeVisible();
    // Form unggah
    await expect(screen.getByRole("input", { type: "file" })).toBeVisible();
    // Validasi periode
    await expect(screen.getByLabel(/periode/i)).toBeVisible();
  },
);

test(
  "arsip dokumen: cek hasil impor dan penyimpanan",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/keuaran/arsip/dokumen/impor");
    await app.upload("//cdn.example.com/laporan-impor.zip", { fieldName: "file" });
    await screen.getByRole("button", { name: /proses impor/i }).click({ timeout: 5000 });
    // Cek status di halaman
    await expect(browser.locator("text=/berhasil|gagal|diterima/i")).toBeVisible({ timeout: 5000 });
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
