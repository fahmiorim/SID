import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-SUR-011 — Buku surat dinas.
 *
 * Alur penuh dari UI: catat surat dinas baru, temukan lewat pencarian, ubah
 * perihalnya, lalu hapus. Sebelumnya test ini hanya memastikan halaman termuat.
 */
test(
  "surat dinas: catat, cari, ubah, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen }) => {
    const cap = Date.now();
    const nomor = `001/UJI/${cap}`;
    const perihal = `Perihal uji ${cap}`;
    const perihalBaru = `Perihal diubah ${cap}`;

    await app.open("/persuratan/surat-dinas");
    await expect(screen.getByRole("heading", { name: "Surat Dinas" })).toBeVisible();
    await expect(screen.getByRole("table")).toBeVisible();

    // Catat surat dinas baru.
    await screen.getByRole("button", { name: "Catat Surat Dinas" }).tap();
    await expect(screen.getByRole("dialog", { name: "Catat Surat Dinas" })).toBeVisible();
    await screen.getByLabel("Nomor Surat *").fill(nomor);
    await screen.getByLabel("Penerima").fill(`Dinas Uji ${cap}`);
    await screen.getByLabel("Perihal *").fill(perihal);
    await screen.getByLabel("Isi Surat").fill("Isi surat dinas uji E2E.");
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Surat dinas dicatat.")).toBeVisible({ timeout: 10_000 });

    // Pencarian menemukan surat yang baru dicatat.
    await app.open(`/persuratan/surat-dinas?q=${encodeURIComponent(perihal)}`);
    await expect(screen.getByRole("row").filter({ hasText: perihal })).toBeVisible();

    // Pencarian tanpa hasil menampilkan pesan kosong, bukan tabel berisi data lain.
    await app.open(`/persuratan/surat-dinas?q=${encodeURIComponent(`tidak-ada-${cap}`)}`);
    await expect(screen.getByText("Tidak ada surat yang cocok.")).toBeVisible();

    // Ubah perihal lewat menu aksi baris.
    await app.open(`/persuratan/surat-dinas?q=${encodeURIComponent(perihal)}`);
    await screen
      .getByRole("row")
      .filter({ hasText: perihal })
      .getByRole("button", { name: new RegExp(`Aksi surat dinas ${nomor}`) })
      .tap();
    await screen.getByRole("menuitem", { name: "Ubah" }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Surat Dinas" })).toBeVisible();
    await screen.getByLabel("Perihal *").fill(perihalBaru);
    await screen.getByRole("button", { name: "Simpan Perubahan" }).tap();

    await app.open(`/persuratan/surat-dinas?q=${encodeURIComponent(perihalBaru)}`);
    await expect(screen.getByRole("row").filter({ hasText: perihalBaru })).toBeVisible({
      timeout: 10_000,
    });

    // Hapus lewat menu aksi baris dengan konfirmasi.
    await screen
      .getByRole("row")
      .filter({ hasText: perihalBaru })
      .getByRole("button", { name: new RegExp(`Aksi surat dinas ${nomor}`) })
      .tap();
    await screen.getByRole("menuitem", { name: "Hapus" }).tap();
    await expect(screen.getByRole("alertdialog", { name: "Hapus surat dinas?" })).toBeVisible();
    await screen.getByRole("alertdialog").getByRole("button", { name: "Hapus", exact: true }).tap();

    await app.open(`/persuratan/surat-dinas?q=${encodeURIComponent(perihalBaru)}`);
    await expect(screen.getByText("Tidak ada surat yang cocok.")).toBeVisible({ timeout: 10_000 });
  },
);
