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
    await expect(screen.getByRole("table").first()).toBeVisible({ timeout: 5000 });
    // Kotak masuk (CardTitle bukan heading)
    await expect(screen.getByText(/kotak masuk email/i)).toBeVisible({ timeout: 5000 });
  },
);

test("webhook email menolak payload tanpa token", async ({ app, browser }) => {
  await app.open("/");
  // POST tanpa token harus ditolak (400 payload tidak valid, 401 token salah,
  // atau 503 bila EMAIL_WEBHOOK_TOKEN belum dikonfigurasi)
  const hasil = await browser.evaluate(async () => {
    const respons = await fetch("/api/webhooks/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "test@example.com",
        subject: "Test",
        body: "Test body",
      }),
    });
    return { status: respons.status, body: await respons.text() };
  });
  expect([400, 401, 503]).toContain(hasil.status);
  expect(hasil.body).toMatch(/tidak valid|belum dikonfigurasi/i);
});
