import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatPelangganDesaLainUji, hapusPelangganDesaLainUji } from "./support/database";

// Katalog: OS-MOD-005 — pelanggan, status langganan, dokumen kerja sama.
test(
  "admin mendaftarkan pelanggan, mengubah status langganan, dan mengunggah dokumen kerja sama",
  { session: "admin" },
  async ({ app, browser, screen }) => {
    const cap = Date.now();
    const namaPelanggan = `Pelanggan E2E ${cap}`;
    const namaKerjasama = `Kerja Sama E2E ${cap}`;

    // 1. Daftarkan pelanggan lewat dialog admin.
    await app.open("/pelanggan");
    await screen.getByRole("button", "Add Customer").tap();
    await screen.getByRole("textbox", "Name").fill(namaPelanggan);
    await screen.getByRole("textbox", "Contact").fill("08123456789");
    await screen.getByRole("button", "Simpan").tap();
    await expect(screen.getByText("Pelanggan berhasil ditambahkan.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(screen.getByText(namaPelanggan, { exact: true })).toBeVisible();

    // 2. Ubah status langganan pelanggan tersebut.
    await screen
      .getByRole("row", { name: new RegExp(namaPelanggan) })
      .getByRole("button", { name: "Ubah Status" })
      .tap();
    await screen.getByRole("combobox").tap();
    await screen.getByRole("option", "Aktif").tap();
    await screen.getByRole("textbox", "No. Kerjasama").fill(`PJ/${cap}/2026`);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Status langganan berhasil diperbarui.")).toBeVisible({
      timeout: 10_000,
    });

    // 3. Pendaftaran kerja sama dengan unggah dokumen PDF.
    await app.open("/pelanggan/kerja-sama");
    await screen.getByRole("textbox", "Nama Pelanggan").fill(namaKerjasama);
    await browser
      .locator('input[name="dokumenKerjasama"]')
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Daftar", exact: true }).tap();
    await expect(screen.getByText("Pendaftaran kerja sama berhasil disimpan")).toBeVisible({
      timeout: 10_000,
    });

    // 4. Dokumen tersimpan dan dapat dibuka operator.
    await app.open("/pelanggan");
    const tautan = screen
      .getByRole("row", { name: new RegExp(namaKerjasama) })
      .getByRole("link", { name: "Lihat dokumen" });
    await expect(tautan).toBeVisible();
    const href = await tautan.getAttribute("href");
    expect(href).toMatch(/^\/pelanggan\/\d+\/dokumen$/);

    // 5. Unduhan benar-benar menyajikan berkas PDF yang diunggah.
    const unduhan = await browser.evaluate(async (url: string) => {
      const respons = await fetch(url);
      const isi = await respons.arrayBuffer();
      return {
        status: respons.status,
        tipe: respons.headers.get("content-type") ?? "",
        disposisi: respons.headers.get("content-disposition") ?? "",
        awal: new TextDecoder().decode(new Uint8Array(isi.slice(0, 5))),
        ukuran: isi.byteLength,
      };
    }, href as string);
    expect(unduhan.status).toBe(200);
    expect(unduhan.tipe).toContain("application/pdf");
    expect(unduhan.disposisi).toContain("inline");
    expect(unduhan.awal).toBe("%PDF-");
    expect(unduhan.ukuran).toBeGreaterThan(0);
  },
);

// Katalog: OS-MOD-005 — unduhan menolak ID tidak valid dan baris desa lain.
test(
  "unduhan dokumen kerja sama menolak ID tidak valid dan pelanggan desa lain",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/pelanggan");
    const desaLain = await buatPelangganDesaLainUji(`Pelanggan Desa Lain ${Date.now()}`);

    try {
      const hasil = await browser.evaluate(async (idDesaLain: number) => {
        const [tidakValid, lintasDesa, tidakAda] = await Promise.all([
          fetch("/pelanggan/abc/dokumen"),
          fetch(`/pelanggan/${idDesaLain}/dokumen`),
          fetch("/pelanggan/999999999/dokumen"),
        ]);
        return {
          tidakValid: { status: tidakValid.status, body: await tidakValid.text() },
          lintasDesa: { status: lintasDesa.status, body: await lintasDesa.text() },
          tidakAda: { status: tidakAda.status, body: await tidakAda.text() },
        };
      }, desaLain.id);

      expect(hasil.tidakValid.status).toBe(400);
      expect(hasil.tidakValid.body).toContain("tidak valid");
      // Desa lain tidak terlihat meski ID pelanggannya diketahui.
      expect(hasil.lintasDesa.status).toBe(404);
      expect(hasil.lintasDesa.body).toContain("tidak ditemukan");
      expect(hasil.tidakAda.status).toBe(404);
    } finally {
      await hapusPelangganDesaLainUji(desaLain.id, desaLain.villageId);
    }
  },
);

// Katalog: OS-MOD-005 — unduhan bukan jalur publik.
test(
  "unduhan dokumen kerja sama menolak akun tanpa izin dan permintaan tanpa sesi",
  { session: "warga-e2e" },
  async ({ app, browser }) => {
    await app.open("/layanan-mandiri/beranda");
    const hasil = await browser.evaluate(async () => {
      const denganSesi = await fetch("/pelanggan/1/dokumen");
      // Tanpa cookie: `redirect: "manual"` menghasilkan respons opaque (status 0),
      // jadi redirect diikuti dan URL akhirnya yang diperiksa.
      const tanpaSesi = await fetch("/pelanggan/1/dokumen", { credentials: "omit" });
      return {
        denganSesi: { status: denganSesi.status, body: await denganSesi.text() },
        tanpaSesi: {
          status: tanpaSesi.status,
          akhir: tanpaSesi.url,
          body: await tanpaSesi.text(),
        },
      };
    });

    // Akun warga tidak punya izin `pelanggan`; route menolak di server, bukan
    // hanya menyembunyikan tautan di UI.
    expect(hasil.denganSesi.status).toBe(403);
    expect(hasil.denganSesi.body).toContain("hak akses");
    // Tanpa cookie sesi, proxy mengalihkan ke halaman masuk dan berkas tidak tersaji.
    expect(hasil.tanpaSesi.status).toBe(200);
    expect(hasil.tanpaSesi.akhir).toContain("/masuk?next=");
    expect(hasil.tanpaSesi.body).not.toContain("%PDF-");
  },
);
