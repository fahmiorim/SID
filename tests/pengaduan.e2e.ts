import { test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import {
  ambilPengaduanTerbaruDariJudul,
  ambilStatusPengaduanDariJudul,
  hapusPengaduanDariJudul,
} from "./support/database";
import { masukDenganKredensial } from "./support/login";

const KATALOG = "OS-WEB-009";

/**
 * Katalog: OS-WEB-009 — Pengaduan publik: kirim, lacak dengan nomor tiket,
 * lalu operator menanggapi dan statusnya terlihat kembali oleh pelapor.
 */
test(
  `${KATALOG} — pengaduan publik dikirim, dilacak, dan ditanggapi operator`,
  { timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const judul = `Pengaduan E2E ${Date.now()}`;
    const telepon = "081234567890";
    const tanggapan = "Sudah diteruskan ke petugas kebersihan desa.";
    let nomorTiket = "";

    try {
      // 1. Warga mengirim pengaduan tanpa akun.
      await app.open("/desa/pengaduan");
      await screen.getByLabel("Judul").fill(judul);
      await screen
        .getByLabel("Uraian pengaduan")
        .fill("Jalan depan balai desa rusak dan berlubang sejak minggu lalu.");
      await screen.getByLabel("Nama").fill("Warga Pengadu E2E");
      await screen.getByLabel(/^Telepon/).fill(telepon);
      await screen.getByRole("button", { name: "Kirim pengaduan" }).tap();

      await expect(screen.getByText(/Pengaduan terkirim dengan nomor tiket PGD-/)).toBeVisible({
        timeout: 15_000,
      });
      nomorTiket = (await ambilPengaduanTerbaruDariJudul(judul)).nomorTiket;
      expect(nomorTiket).toMatch(/^PGD-/);

      // 2. Warga melacak tiket dengan identitas yang dipakai saat mengirim.
      await app.open("/desa/pengaduan/lacak");
      await screen.getByLabel("Nomor tiket").fill(nomorTiket);
      await screen.getByLabel(/NIK, telepon, atau email/).fill(telepon);
      await screen.getByRole("button", { name: "Lacak pengaduan" }).tap();
      await expect(screen.getByText(judul)).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByText("Baru")).toBeVisible();
      await expect(screen.getByText(/Belum ada tanggapan/)).toBeVisible();

      // 3. Operator menanggapi lewat dialog detail.
      await app.clearState();
      await app.open("/masuk");
      const admin = credentials.user("admin");
      await masukDenganKredensial(screen, browser, admin.username, admin.password);
      await expect(browser).toHaveURL("/beranda");

      await app.open(`/pengaduan?q=${encodeURIComponent(nomorTiket)}`);
      await screen
        .getByRole("row")
        .filter({ hasText: nomorTiket })
        .getByRole("button", { name: `Aksi pengaduan ${nomorTiket}` })
        .tap();
      await screen.getByRole("menuitem", { name: /Detail/ }).tap();
      await expect(screen.getByRole("dialog")).toBeVisible();
      // Radix Select menyimpan nilainya di state React; pilih lewat UI agar
      // form action menerima status yang benar.
      await screen.getByRole("dialog").getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Diproses" }).tap();
      await expect(screen.getByRole("dialog").getByRole("combobox")).toContainText("Diproses");
      await screen.getByLabel("Tanggapan").fill(tanggapan);
      await screen.getByRole("button", { name: "Simpan tanggapan" }).tap();

      // Tunggu Server Action benar-benar commit sebelum pindah halaman; tabel
      // di belakang dialog yang masih terbuka belum tentu ikut ter-refresh.
      let statusDb: string | null = null;
      for (let percobaan = 0; percobaan < 30; percobaan++) {
        statusDb = await ambilStatusPengaduanDariJudul(judul);
        if (statusDb === "diproses") break;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      expect(statusDb).toBe("diproses");

      // 4. Status dan tanggapan bertahan di tabel admin.
      await app.open(`/pengaduan?q=${encodeURIComponent(nomorTiket)}`);
      const baris = screen.getByRole("row").filter({ hasText: nomorTiket });
      await expect(baris.getByText("Diproses")).toBeVisible();

      // 5. Pelapor melihat hasil yang sama saat melacak lagi.
      await app.clearState();
      await app.open("/desa/pengaduan/lacak");
      await screen.getByLabel("Nomor tiket").fill(nomorTiket);
      await screen.getByLabel(/NIK, telepon, atau email/).fill(telepon);
      await screen.getByRole("button", { name: "Lacak pengaduan" }).tap();
      await expect(screen.getByText("Diproses")).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByText(tanggapan)).toBeVisible();
    } finally {
      await hapusPengaduanDariJudul(judul);
    }
  },
);
