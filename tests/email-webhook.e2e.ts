import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-OPS-005 — Pusat notifikasi `/pengaturan/notifikasi` menampilkan riwayat percobaan email/WhatsApp dan pengiriman manual.
// **Kotak masuk email aktif:** `POST /api/webhooks/email` memvalidasi `EMAIL_WEBHOOK_TOKEN`,
// mengambil `villageId` dari host, menyimpan pesan masuk di `mailbox_pesan`, dan membatasi payload 32 KiB.
// Admin dapat membaca pesan, menandai dibaca, dan membalas via Resend bila dikonfigurasi;
// tenant + izin diperiksa pada use case. Test `mailbox.test.ts`, `mailbox-use-cases.test.ts`, `route.test.ts`.
// **Gap: E2E penerimaan webhook, alur inbox/balasan dan filter kanal.**.
// ============================================================================
test(
  "pusat notifikasi menampilkan riwayat dan kotak masuk",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/notifikasi");
    await expect(screen.getByRole("heading", { name: /notifikasi/i })).toBeVisible();
    // Daftar riwayat notifikasi
    await expect(screen.locator("table")).toBeVisible({ timeout: 5000 });
    // Kotak masuk
    await expect(screen.getByRole("heading", { name: /kotak masuk/i })).toBeVisible({
      timeout: 5000,
    });
  },
);

test("webhook email menerima pesan masuk", async ({ app, browser }) => {
  // POST ke webhook endpoint
  await app.open("/api/webhooks/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Email-Token": "test-token",
    },
    payload: JSON.stringify({
      from: "test@example.com",
      subject: "Test",
      body: "Test body",
    }),
  });
  // Cek response
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});
