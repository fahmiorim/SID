import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaLogoDesaUji,
  hapusBerkasMediaUji,
  pulihkanLogoDesaUji,
  tulisBerkasMediaUji,
} from "./support/database";

/**
 * Katalog: OS-OPS-010 — unggahan media, penyajian berkas, dan kontrol akses.
 *
 * Unggahan dilakukan lewat formulir identitas desa. Test membuktikan MIME
 * divalidasi, nama/ekstensi disimpan aman, media hanya disajikan pada host
 * desa pemilik, kategori privat tidak bisa dibuka lewat route publik, dan SVG
 * aktif mendapat sandbox.
 */
test(
  "OS-OPS-010 — unggah logo, validasi MIME, isolasi tenant, dan sandbox SVG",
  { session: "admin", timeout: 150_000 },
  async ({ app, browser, screen }) => {
    const awal = await bacaLogoDesaUji();
    const berkasBaru: string[] = [];

    try {
      await app.open("/pengaturan/desa");
      await expect(screen.getByRole("heading", { name: "Identitas Desa" })).toBeVisible();

      await browser
        .locator('input[name="logoBerkas"]')
        .setInputFiles("tests/fixtures/logo-uji.png");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Identitas desa diperbarui.")).toBeVisible({
        timeout: 15_000,
      });

      const setelahPng = await bacaLogoDesaUji();
      expect(setelahPng.villageId).toBe(awal.villageId);
      expect(setelahPng.logo).toMatch(new RegExp(`^${awal.villageId}/umum/.+\\.png$`));
      if (!setelahPng.logo) throw new Error("Logo PNG tidak tersimpan.");
      berkasBaru.push(setelahPng.logo);

      const publik = await browser.evaluate(async (url: string) => {
        const respons = await fetch(url);
        return {
          status: respons.status,
          tipe: respons.headers.get("content-type") ?? "",
          nosniff: respons.headers.get("x-content-type-options") ?? "",
          cache: respons.headers.get("cache-control") ?? "",
        };
      }, `/api/publik/media/${setelahPng.logo}`);

      expect(publik).toMatchObject({
        status: 200,
        tipe: "image/png",
        nosniff: "nosniff",
      });
      expect(publik.cache).toContain("immutable");

      const namaBerkas = setelahPng.logo.split("/").pop() ?? "";
      const lintasDesa = await browser.evaluate(
        async (url: string) => {
          const respons = await fetch(url);
          return respons.status;
        },
        `/api/publik/media/${awal.villageId + 1}/umum/${namaBerkas}`,
      );
      expect(lintasDesa).toBe(404);

      const jalurPrivat = `${awal.villageId}/permohonan/${namaBerkas}`;
      await tulisBerkasMediaUji(jalurPrivat, Buffer.from("berkas privat uji"));
      berkasBaru.push(jalurPrivat);

      const kategoriPrivat = await browser.evaluate(async (url: string) => {
        const respons = await fetch(url);
        return respons.status;
      }, `/api/publik/media/${jalurPrivat}`);
      expect(kategoriPrivat).toBe(404);

      // MIME di luar allowlist tidak boleh mengganti logo.
      await app.open("/pengaturan/desa");
      await browser.locator('input[name="logoBerkas"]').setInputFiles("tests/fixtures/jahat.html");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText(/Tipe berkas text\/html tidak diizinkan/)).toBeVisible({
        timeout: 15_000,
      });

      const setelahGagal = await bacaLogoDesaUji();
      expect(setelahGagal.logo).toBe(setelahPng.logo);

      // SVG disimpan, tetapi respons publik harus menyandbox dokumen aktif.
      await browser
        .locator('input[name="logoBerkas"]')
        .setInputFiles("tests/fixtures/logo-uji.svg");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Identitas desa diperbarui.")).toBeVisible({
        timeout: 15_000,
      });

      const setelahSvg = await bacaLogoDesaUji();
      expect(setelahSvg.logo).toMatch(new RegExp(`^${awal.villageId}/umum/.+\\.svg$`));
      if (!setelahSvg.logo) throw new Error("Logo SVG tidak tersimpan.");
      berkasBaru.push(setelahSvg.logo);

      const svg = await browser.evaluate(async (url: string) => {
        const respons = await fetch(url);
        return {
          status: respons.status,
          tipe: respons.headers.get("content-type") ?? "",
          csp: respons.headers.get("content-security-policy") ?? "",
          nosniff: respons.headers.get("x-content-type-options") ?? "",
        };
      }, `/api/publik/media/${setelahSvg.logo}`);

      expect(svg).toMatchObject({
        status: 200,
        tipe: "image/svg+xml",
        nosniff: "nosniff",
      });
      expect(svg.csp).toContain("sandbox");
    } finally {
      for (const relatif of berkasBaru) {
        await hapusBerkasMediaUji(relatif);
      }
      await pulihkanLogoDesaUji(awal.villageId, awal.logo);
    }
  },
);

test(
  "OS-OPS-010 — lampiran pengaduan privat menolak tamu dan akun warga",
  { session: "warga-e2e", timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/layanan-mandiri/beranda");

    const hasil = await browser.evaluate(async () => {
      const denganSesi = await fetch("/api/pengaduan/lampiran/1/pengaduan/uji.pdf");
      const tanpaSesi = await fetch("/api/pengaduan/lampiran/1/pengaduan/uji.pdf", {
        credentials: "omit",
      });
      return {
        denganSesi: { status: denganSesi.status, body: await denganSesi.text() },
        tanpaSesi: { status: tanpaSesi.status, body: await tanpaSesi.text() },
      };
    });

    expect(hasil.denganSesi.status).toBe(403);
    expect(hasil.denganSesi.body).toContain("tidak memiliki hak akses");
    expect(hasil.tanpaSesi.status).toBe(401);
    expect(hasil.tanpaSesi.body).toContain("harus masuk");
  },
);
