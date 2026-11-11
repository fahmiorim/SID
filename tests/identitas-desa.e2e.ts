import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaIdentitasDesaLengkapUji,
  hapusBerkasMediaUji,
  pulihkanIdentitasDesaLengkapUji,
} from "./support/database";

/**
 * Katalog: OS-GOV-001 — identitas desa, kepala desa, alamat, kontak, logo,
 * tanda tangan, dan stempel.
 *
 * Test mengubah data lewat formulir admin, memuat ulang untuk membuktikan
 * persistensi, memeriksa halaman kontak publik, menolak email tidak valid, dan
 * mengunggah tanda tangan/stempel. Semua nilai awal dipulihkan di akhir.
 */
test(
  "identitas desa: kontak, kepala desa, tanda tangan, stempel, dan validasi",
  { session: "admin", timeout: 180_000 },
  async ({ app, browser, screen }) => {
    const awal = await bacaIdentitasDesaLengkapUji();
    const tanda = Date.now().toString().slice(-8);
    const kepalaDesa = `Kepala Desa E2E ${tanda}`;
    const alamat = `Jl. Identitas E2E ${tanda}`;
    const email = `desa.${tanda}@contoh.id`;
    const telepon = `0812${tanda}`;
    const website = `https://desa-${tanda}.contoh.id`;
    const nip = `NIP-${tanda}`;
    const berkasBaru: string[] = [];

    try {
      await app.open("/pengaturan/desa");
      await expect(screen.getByRole("heading", { name: "Identitas Desa" })).toBeVisible();

      await screen.getByLabel("Nama Kepala Desa").fill(kepalaDesa);
      await screen.getByLabel("NIP/NIAP Kepala Desa").fill(nip);
      await screen.getByLabel("Alamat Kantor").fill(alamat);
      await screen.getByLabel("Email Desa").fill(email);
      await screen.getByLabel("Telepon").fill(telepon);
      await screen.getByLabel("Website").fill(website);
      await browser
        .locator('input[name="tandaTanganBerkas"]')
        .setInputFiles("tests/fixtures/logo-uji.png");
      await browser
        .locator('input[name="stempelBerkas"]')
        .setInputFiles("tests/fixtures/logo-uji.png");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Identitas desa diperbarui.")).toBeVisible({
        timeout: 20_000,
      });

      const tersimpan = await bacaIdentitasDesaLengkapUji();
      expect(tersimpan.headName).toBe(kepalaDesa);
      expect(tersimpan.headNip).toBe(nip);
      expect(tersimpan.officeAddress).toBe(alamat);
      expect(tersimpan.email).toBe(email);
      expect(tersimpan.phone).toBe(telepon);
      expect(tersimpan.website).toBe(website);
      expect(tersimpan.signature).toMatch(new RegExp(`^${awal.villageId}/umum/.+\\.png$`));
      expect(tersimpan.stamp).toMatch(new RegExp(`^${awal.villageId}/umum/.+\\.png$`));
      if (tersimpan.signature) berkasBaru.push(tersimpan.signature);
      if (tersimpan.stamp) berkasBaru.push(tersimpan.stamp);

      await app.open("/pengaturan/desa");
      await expect(screen.getByLabel("Nama Kepala Desa")).toHaveValue(kepalaDesa);
      await expect(screen.getByLabel("NIP/NIAP Kepala Desa")).toHaveValue(nip);
      await expect(screen.getByLabel("Alamat Kantor")).toHaveValue(alamat);
      await expect(screen.getByLabel("Email Desa")).toHaveValue(email);
      await expect(screen.getByLabel("Telepon")).toHaveValue(telepon);
      await expect(screen.getByLabel("Website")).toHaveValue(website);
      await expect(screen.getByLabel("Logo (URL media)")).toHaveValue(awal.logo ?? "");
      await expect(screen.getByLabel("Tanda Tangan Kepala Desa (URL media)")).toHaveValue(
        tersimpan.signature ?? "",
      );
      await expect(screen.getByLabel("Stempel Desa (URL media)")).toHaveValue(
        tersimpan.stamp ?? "",
      );

      // Data identitas yang tersimpan harus tampil pada halaman publik, bukan
      // hanya tersimpan di DB.
      await app.open("/desa/kontak");
      await expect(screen.getByText(alamat).first()).toBeVisible();
      await expect(screen.getByText(telepon).first()).toBeVisible();
      await expect(screen.getByText(email).first()).toBeVisible();

      // Email tidak valid ditolak tanpa mengubah nilai yang sudah tersimpan.
      await app.open("/pengaturan/desa");
      // `a@b` lolos validasi email bawaan browser tetapi ditolak regex server
      // yang mewajibkan titik pada domain.
      await screen.getByLabel("Email Desa").fill("a@b");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Periksa kembali isian Anda.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(screen.getByText("Format email tidak valid.")).toBeVisible();
      expect((await bacaIdentitasDesaLengkapUji()).email).toBe(email);
    } finally {
      for (const relatif of berkasBaru) {
        await hapusBerkasMediaUji(relatif);
      }
      await pulihkanIdentitasDesaLengkapUji(awal);
    }
  },
);
