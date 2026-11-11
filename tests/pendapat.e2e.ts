import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatPendapatUji,
  hapusPendapatAnonimDariIp,
  hapusPendapatDariPengguna,
  hitungPendapatDariPengguna,
} from "./support/database";

/**
 * Katalog: OS-POP-014 — Pendapat warga dan jajak pendapat.
 *
 * Warga mengirim penilaian dari halaman publik; satu sesi hanya boleh mengirim
 * sekali. Setelah itu admin melihat rekap, mengekspor CSV, dan menghapus baris
 * lewat aksi tabel.
 */
test(
  "jajak pendapat publik: pendapat tercatat, kiriman kedua ditolak",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const pengguna = `E2E Pendapat ${Date.now()}`;
    const penggunaKedua = `${pengguna} ulang`;
    // Browser E2E memakai loopback; buang sisa smoke lama yang memakai sesi sama.
    await hapusPendapatAnonimDariIp("::1");

    try {
      await app.open("/jajak-pendapat");
      await expect(browser.locator("h1")).toHaveText("Jajak Pendapat");

      await screen.getByLabel("Nama (opsional)").fill(pengguna);
      await screen.getByRole("radio", { name: "Puas", exact: true }).tap();
      await screen.getByRole("button", { name: "Kirim Pendapat" }).tap();
      await expect(screen.getByText("Terima kasih, pendapat Anda sudah tercatat.")).toBeVisible({
        timeout: 15_000,
      });
      expect(await hitungPendapatDariPengguna(pengguna)).toBe(1);

      // Sesi yang sama tidak boleh mengirim dua kali; mengganti nama tidak menolong.
      await screen.getByLabel("Nama (opsional)").fill(penggunaKedua);
      await screen.getByRole("radio", { name: "Sangat Puas", exact: true }).tap();
      await screen.getByRole("button", { name: "Kirim Pendapat" }).tap();
      await expect(
        screen.getByText("Anda sudah pernah mengirimkan pendapat untuk sesi ini."),
      ).toBeVisible({ timeout: 15_000 });
      expect(await hitungPendapatDariPengguna(penggunaKedua)).toBe(0);
    } finally {
      await hapusPendapatDariPengguna(pengguna);
      await hapusPendapatDariPengguna(penggunaKedua);
      await hapusPendapatAnonimDariIp("::1");
    }
  },
);

test(
  "pendapat admin: rekap, ekspor CSV, dan hapus pendapat warga",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const pengguna = `E2E Moderasi ${Date.now()}`;
    await buatPendapatUji(pengguna, 4);

    try {
      await app.open("/pendapat");
      await expect(browser.locator("h1")).toHaveText("Pendapat Warga");

      const baris = () => screen.getByRole("row").filter({ hasText: pengguna });
      await expect(baris()).toBeVisible();
      await expect(baris().getByText("Tidak Puas")).toBeVisible();
      await expect(screen.getByText(/Daftar Pendapat \(\d+\)/)).toBeVisible();

      // Ekspor CSV memuat baris yang sedang tampil, bukan hanya menghasilkan berkas.
      const csv = await browser.evaluate(async () => {
        const res = await fetch("/pendapat/ekspor");
        return {
          status: res.status,
          tipe: res.headers.get("content-type"),
          teks: await res.text(),
        };
      });
      expect(csv.status).toBe(200);
      expect(csv.tipe).toContain("text/csv");
      expect(csv.teks).toContain(pengguna);
      expect(csv.teks).toContain("Tidak Puas");

      await baris().getByRole("button", { name: "Hapus pendapat" }).tap();
      await expect(screen.getByText("Pendapat dihapus.")).toBeVisible({ timeout: 15_000 });
      await expect(baris()).toHaveCount(0);
      expect(await hitungPendapatDariPengguna(pengguna)).toBe(0);
    } finally {
      await hapusPendapatDariPengguna(pengguna);
    }
  },
);
