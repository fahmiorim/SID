import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WEB-009 — Pengaduan publik `/desa/pengaduan` + pelacakan `/desa/pengaduan/lacak` + admin.
// Email perubahan status via Resend memakai `RESEND_API_KEY` dan `RESEND_FROM`,
// label status domain benar, serta respons error provider dicatat sebagai gagal.
// Operator menerima toast: email diterima Resend (bukan bukti terkirim) atau peringataan bila pengiriman dilewati/gagal;
// status pengaduan tetap tersimpan. Test `notification.test.ts`, `env.test.ts`, dan `presentation/actions.test.ts`.
// **Ditambah notifikasi WhatsApp via provider (`notifyStatusChangeWhatsApp`), bukti pengiriman ke database (`bukti_pengiriman_notifikasi`),
// dan konfigurasi env `WHATSAPP_API_URL`/`WHATSAPP_TOKEN`.** **Gap: E2E alur pengaduan lengkap.**.
// ============================================================================
test(
  "pengaduan publik dapat diakses dan form tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pengaduan");
    await expect(browser).toHaveURL("/desa/pengaduan");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Form pengaduan
    await expect(browser.locator('[name="judul"], [name="isi"]')).toBeVisible({ timeout: 3000 });
  },
);

test(
  "form pelacakan pengaduan via token tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pengaduan/lacak");
    await expect(browser).toHaveURL("/desa/pengaduan/lacak");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Input token pelacakan
    await expect(browser.locator('[name="token"]')).toBeVisible({ timeout: 3000 });
  },
);

// ============================================================================
// OS-WEB-016 — Tema: teks berjalan (≤300 char) + sosial media (FB, IG, YT, X, TikTok, WA, Telegram)
// ============================================================================
// (Sudah diuji di web-publik.e2e.ts)
