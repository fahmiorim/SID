import { test } from "@e2e-dev/web";
import { expect } from "e2e";

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
    await browser.locator('input[name="dokumenKerjasama"]').setInputFiles({
      name: "perjanjian-kerja-sama.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n% E2E\n"),
    });
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
    expect(await tautan.getAttribute("href")).toMatch(/^\/pelanggan\/\d+\/dokumen$/);
  },
);
