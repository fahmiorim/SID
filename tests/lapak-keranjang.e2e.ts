import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-MOD-004 — lapak, produk terpisah, keranjang, cetak faktur.
test(
  "admin mengelola produk lapak, warga menambah ke keranjang dan mencetak faktur",
  { session: "admin" },
  async ({ app, screen }) => {
    const cap = Date.now();
    const namaLapak = `Lapak E2E ${cap}`;
    const namaProduk = `Produk E2E ${cap}`;

    // 1. Buat lapak baru.
    await app.open("/lapak");
    await screen.getByRole("button", "Tambah Lapak").tap();
    await screen.getByRole("textbox", "Nama Lapak").fill(namaLapak);
    await screen.getByRole("textbox", "Pemilik").fill("Warga E2E");
    await screen.getByRole("button", "Simpan").tap();
    await expect(screen.getByText(namaLapak, { exact: true })).toBeVisible({ timeout: 10_000 });

    // 2. Tambah produk pada lapak tersebut.
    await screen
      .getByRole("row", { name: new RegExp(namaLapak) })
      .getByRole("link", { name: "Kelola produk" })
      .tap();
    await expect(screen.getByRole("heading", { name: "Kelola Produk Lapak" })).toBeVisible();

    await screen.getByRole("button", "Tambah Produk").tap();
    await screen.getByRole("textbox", "Nama Produk *").fill(namaProduk);
    await screen.getByRole("textbox", "Harga (Rp)").fill("15000");
    await screen.getByRole("textbox", "Stok").fill("4");
    await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
    await expect(screen.getByText(namaProduk, { exact: true })).toBeVisible({ timeout: 10_000 });

    // 3. Katalog publik menampilkan produk dan tombol keranjang.
    await app.open(`/desa/lapak?q=${encodeURIComponent(namaLapak)}`);
    await screen.getByRole("link", { name: "Lihat Produk" }).tap();
    await expect(screen.getByText(namaProduk, { exact: true })).toBeVisible();
    await expect(screen.getByText("Rp 15.000")).toBeVisible();

    await screen.getByRole("button", "Tambah ke Keranjang").tap();
    await expect(screen.getByText("Produk berhasil ditambahkan ke keranjang.")).toBeVisible({
      timeout: 10_000,
    });

    // 4. Keranjang berisi produk, lalu faktur dapat dicetak.
    await app.open("/desa/lapak/keranjang");
    await expect(screen.getByRole("heading", { name: "Keranjang Belanja" })).toBeVisible();
    await expect(screen.getByText(namaProduk, { exact: true })).toBeVisible();
    await expect(screen.getByText("Total: Rp 15.000")).toBeVisible();

    await screen.getByRole("link", { name: "Cetak Faktur" }).tap();
    await expect(screen.getByRole("heading", { name: "Faktur Belanja" })).toBeVisible();
    await expect(screen.getByText(namaProduk, { exact: true })).toBeVisible();
    await expect(screen.getByText("Rp 15.000")).toBeVisible();
  },
);
