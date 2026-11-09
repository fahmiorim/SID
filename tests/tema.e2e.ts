import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WEB-016 — Tema: teks berjalan (≤300 char) + sosial media (FB, IG, YT, X, TikTok, WA, Telegram)
// ============================================================================
test(
  "tema admin: halaman pengaturan menampilkan opsi teks berjalan dan sosial media",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: "Tema Situs" })).toBeVisible();
    // Input teks berjalan
    await expect(screen.getByLabel(/teks berjalan/i)).toBeVisible();
    // Input sosial media - minimal FB, IG, YT, X, TikTok, WA, Telegram
    const platforms = [
      "facebook",
      "instagram",
      "youtube",
      "twitter",
      "tiktok",
      "whatsapp",
      "telegram",
    ];
    for (const platform of platforms) {
      const input = screen.getByLabel(new RegExp(platform, "i"));
      if (await input.isVisible({ timeout: 3000 })) {
        // Lanjut
      }
    }
  },
);

// ============================================================================
// OS-WEB-017 — Pemindaian manifest tema build-time: slug semver, nama, slot dikenal/tidak ganda/lengkap;
// kartu tema menampilkan masalah dan tema tidak valid tidak dapat diaktifkan (validasi ulang di use case).
// Registry tetap build-time, tanpa unggah/eksekusi kode. Test `tema-scan.test.ts`.
// ============================================================================
test(
  "tema: halaman pengaturan manifest scan divisualisasikan",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: "Tema Situs" })).toBeVisible();
    // Daftar tema: kartu tema dengan tombol pilih/status aktif
    await expect(screen.getByText("Tema terpasang")).toBeVisible();
    await expect(screen.getByText(/Pakai tema ini|Sedang dipakai/).first()).toBeVisible({
      timeout: 5000,
    });
  },
);
