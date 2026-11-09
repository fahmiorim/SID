import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { pulihkanPluginUji, siapkanPluginAktifUji } from "./support/database";

/**
 * Katalog: OS-OPS-008 — Plugin: status aktif disimpan per desa. Aktivasi
 * ditolak bila environment wajib belum diisi, sedangkan nonaktivasi tetap
 * boleh dan langsung terlihat di daftar.
 */
test(
  "OS-OPS-008 — plugin: nonaktivasi tersimpan dan aktivasi tanpa env ditolak",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const asal = await siapkanPluginAktifUji("whatsapp-gateway");

    try {
      await app.open("/pengaturan/plugin");
      await expect(screen.getByRole("heading", { name: /Plugin/i })).toBeVisible();

      await screen.getByRole("button", { name: "Nonaktifkan", exact: true }).tap();
      await expect(screen.getByText("Plugin dinonaktifkan.")).toBeVisible({ timeout: 15_000 });

      await app.open("/pengaturan/plugin");
      await expect(
        screen.getByRole("button", { name: "Aktifkan", exact: true }).first(),
      ).toBeVisible();

      // Aktivasi kembali harus ditolak selama environment belum diisi; status
      // tidak boleh berubah diam-diam.
      await screen.getByRole("button", { name: "Aktifkan", exact: true }).first().tap();
      await expect(screen.getByText(/belum dapat diaktifkan: environment/i)).toBeVisible({
        timeout: 15_000,
      });

      await app.open("/pengaturan/plugin");
      await expect(screen.getByText(/Environment belum terisi/).first()).toBeVisible();
      await expect(screen.getByRole("button", { name: "Nonaktifkan", exact: true })).toHaveCount(0);
    } finally {
      await pulihkanPluginUji(asal);
    }
  },
);
