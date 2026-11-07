import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-OPS-008 — Registri plugin build-time + tabel `plugin_registry`; halaman `/pengaturan/plugin`
// dan aktivasi berizin/audit tersedia. Integrasi yang terdaftar: WhatsApp dan Resend.
// Test domain/use case tersedia. **Gap: E2E plugin.**.
// ============================================================================
test(
  "plugin registry halaman aktif bisa diakses",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/plugin");
    await expect(screen.getByRole("heading", { name: /plugin/i })).toBeVisible();
    // Daftar provider terdaftar
    await expect(screen.getByText(/WhatsApp|Resend/i)).toBeVisible({ timeout: 5000 });
    // Status aktif/nonaktif
    await expect(screen.getByText(/aktif|nonaktif/i)).toBeVisible({ timeout: 3000 });
  },
);

test("plugin aktivasi berizin tersedia", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/pengaturan/plugin/aktivasi");
  await expect(screen.getByRole("heading", { name: /aktivasi plugin/i })).toBeVisible();
  // Form aktivasi
  await expect(screen.getByLabel(/nama provider/i)).toBeVisible();
  await expect(screen.getByRole("button", { name: /aktifkan/i })).toBeVisible();
});
