import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatIdmUji, buatSdgsUji, hapusIdmTahun } from "./support/database";

const TAHUN_IDM = 2097;
const TAHUN_SDGS = 2098;
const TAHUN_PUBLIK = 2099;

/**
 * Katalog: OS-GOV-006 — Laporan/ekspor IDM.
 *
 * Indikator tiga dimensi diisi lewat dialog, rekap dan status dihitung ulang,
 * ekspor CSV memuat indikator tahun terpilih, lalu baris dihapus lewat aksi
 * tabel sampai halaman kembali kosong.
 */
test(
  "IDM admin: indikator tiga dimensi, rekap, ekspor CSV, lalu hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const namaIndikator = [
      `Sosial E2E ${Date.now()}`,
      `Ekonomi E2E ${Date.now()}`,
      `Lingkungan E2E ${Date.now()}`,
    ];

    async function tambahIndikator(kode: string, nama: string, skor: number) {
      await screen.getByRole("button", { name: "Tambah Indikator" }).tap();
      const dialog = screen.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Tambah Indikator IDM" })).toBeVisible();
      await dialog.getByLabel("Kode").fill(kode);
      await dialog.getByLabel("Nama Indikator").fill(nama);
      await dialog.getByLabel("Skor (0–100)").fill(String(skor));
      await dialog.getByLabel("Kategori").fill("Uji E2E");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });
    }

    try {
      await app.open(`/desa/idm?tahun=${TAHUN_IDM}`);
      await expect(browser.locator("h1")).toContainText("Status Desa / IDM");
      await expect(screen.getByText("Belum ada data indikator IDM.")).toBeVisible();

      // 1. Satu indikator per dimensi: IKS, IKE, IKL.
      await tambahIndikator("I.1", namaIndikator[0], 80);
      await tambahIndikator("II.1", namaIndikator[1], 60);
      await tambahIndikator("III.1", namaIndikator[2], 40);

      for (const nama of namaIndikator) {
        await expect(screen.getByRole("row").filter({ hasText: nama })).toBeVisible();
      }
      // Skor IDM = rata-rata tiga dimensi (0,8 + 0,6 + 0,4) / 3 = 0,600.
      await expect(screen.getByText("0,800", { exact: true })).toBeVisible();
      await expect(screen.getByText("0,400", { exact: true })).toBeVisible();
      await expect(screen.getByText("0,600", { exact: true }).first()).toBeVisible();
      await expect(screen.getByText("Berkembang", { exact: true })).toBeVisible();

      // 2. Ubah skor satu indikator; rekap ikut berubah.
      const barisSosial = () => screen.getByRole("row").filter({ hasText: namaIndikator[0] });
      await barisSosial().getByRole("button", { name: "Ubah" }).tap();
      const dialogUbah = screen.getByRole("dialog");
      await expect(dialogUbah.getByRole("heading", { name: "Ubah Indikator IDM" })).toBeVisible();
      await dialogUbah.getByLabel("Skor (0–100)").fill("100");
      await dialogUbah.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialogUbah).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText("0,667", { exact: true })).toBeVisible();

      // 3. Ekspor laporan memuat indikator dan tahun yang dipilih.
      const tautanEkspor = await browser.evaluate(() => {
        const tautan = [...document.querySelectorAll("a")].find((item) =>
          item.textContent?.includes("Ekspor laporan"),
        );
        return tautan ? tautan.getAttribute("href") : null;
      });
      expect(tautanEkspor).toBe(`/desa/idm/ekspor?tahun=${TAHUN_IDM}`);

      const csv = await browser.evaluate(async (href) => {
        const res = await fetch(href as string);
        return {
          status: res.status,
          tipe: res.headers.get("content-type"),
          teks: await res.text(),
        };
      }, tautanEkspor);
      expect(csv.status).toBe(200);
      expect(csv.tipe).toContain("text/csv");
      expect(csv.teks).toContain(String(TAHUN_IDM));
      expect(csv.teks).toContain("I.1");
      expect(csv.teks).toContain(namaIndikator[0]);

      // 4. Hapus ketiga indikator lewat aksi tabel.
      for (const nama of namaIndikator) {
        const baris = screen.getByRole("row").filter({ hasText: nama });
        await baris.getByRole("button", { name: "Hapus" }).tap();
        await expect(baris).toHaveCount(0, { timeout: 15_000 });
      }
      await expect(screen.getByText("Belum ada data indikator IDM.")).toBeVisible();
    } finally {
      await hapusIdmTahun(TAHUN_IDM);
    }
  },
);

/**
 * Katalog: OS-GOV-006 — Capaian SDGs Desa per tahun.
 *
 * Admin mengisi tujuan dari tabel, melihat skor/predikat berubah, mengubah
 * nilai yang sudah ada (upsert), lalu menghapus capaian sampai kosong.
 */
test(
  "SDGs admin: isi dan ubah capaian, skor serta predikat ikut berubah, lalu hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const goalPertama = "Desa Tanpa Kemiskinan";
    const goalKedua = "Desa Tanpa Kelaparan";
    const keterangan = `Capaian E2E ${Date.now()}`;

    async function simpanGoal(goal: string, aksi: "Isi" | "Ubah", skor: number, catatan: string) {
      const baris = () => screen.getByRole("row").filter({ hasText: goal });
      await baris().getByRole("button", { name: aksi }).tap();
      const dialog = screen.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: new RegExp(goal) })).toBeVisible();
      await dialog.getByLabel("Skor (0–100)").fill(String(skor));
      await dialog.getByLabel("Keterangan").fill(catatan);
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });
    }

    try {
      await app.open(`/desa/idm-sdgs?tahun=${TAHUN_SDGS}`);
      await expect(browser.locator("h1")).toContainText("Capaian SDGs Desa");

      const barisPertama = () => screen.getByRole("row").filter({ hasText: goalPertama });
      await simpanGoal(goalPertama, "Isi", 90, keterangan);
      await expect(barisPertama()).toContainText("0,900");
      await expect(barisPertama()).toContainText(keterangan);
      await expect(screen.getByText("90.0 %", { exact: true })).toBeVisible();
      await expect(screen.getByText("Sangat Baik", { exact: true })).toBeVisible();

      // Ubah nilai yang sudah ada: upsert, bukan baris baru.
      await simpanGoal(goalPertama, "Ubah", 70, `${keterangan} diperbarui`);
      await expect(barisPertama()).toContainText("0,700");
      await expect(barisPertama()).toContainText(`${keterangan} diperbarui`);
      await expect(screen.getByText("70.0 %", { exact: true })).toBeVisible();
      await expect(screen.getByText("Baik", { exact: true })).toBeVisible();

      // Tujuan kedua menurunkan rata-rata menjadi (70 + 50) / 2 = 60 %.
      await simpanGoal(goalKedua, "Isi", 50, `${keterangan} kedua`);
      await expect(screen.getByRole("row").filter({ hasText: goalKedua })).toContainText("0,500");
      await expect(screen.getByText("60.0 %", { exact: true })).toBeVisible();

      // Hapus tujuan kedua: rata-rata kembali 70 %, barisnya kosong lagi.
      await screen
        .getByRole("row")
        .filter({ hasText: goalKedua })
        .getByRole("button", { name: "Hapus" })
        .tap();
      await expect(
        screen.getByRole("row").filter({ hasText: goalKedua }).getByText("Belum diisi"),
      ).toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText("70.0 %", { exact: true })).toBeVisible();

      await barisPertama().getByRole("button", { name: "Hapus" }).tap();
      await expect(barisPertama().getByText("Belum diisi")).toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText("70.0 %", { exact: true })).toHaveCount(0);
      await expect(screen.getByText("0,700", { exact: true })).toHaveCount(0);
    } finally {
      await hapusIdmTahun(TAHUN_SDGS);
    }
  },
);

/**
 * Katalog: OS-GOV-006 — Halaman publik IDM & SDGs.
 *
 * Tanpa sesi, halaman menampilkan tahun data terbaru, skor, status, dan tabel
 * SDGs tanpa tombol pengelolaan.
 */
test(
  "IDM/SDGs publik: menampilkan data tahun terbaru tanpa kontrol admin",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    try {
      await buatIdmUji({
        tahun: TAHUN_PUBLIK,
        kode: "I.1",
        nama: `Indikator publik E2E ${Date.now()}`,
        skor: 80,
      });
      await buatSdgsUji({
        tahun: TAHUN_PUBLIK,
        goal: 1,
        skor: 60,
        keterangan: "Capaian publik E2E",
      });

      await app.open("/desa/idm-sdgs");
      await expect(browser.locator("h1")).toContainText("Indeks Desa Membangun (IDM) & SDGs");

      const teks = await browser.locator("body").textContent();
      expect(teks).toContain(String(TAHUN_PUBLIK));
      expect(teks).toContain("0,800");
      expect(teks).toContain("Maju");
      expect(teks).toContain("60.0 %");
      expect(teks).toContain("Baik");

      await expect(
        screen.getByRole("row").filter({ hasText: "Desa Tanpa Kemiskinan" }),
      ).toContainText("0,600");
      await expect(screen.getByRole("button", { name: "Isi" })).toHaveCount(0);
      await expect(screen.getByRole("button", { name: "Tambah Indikator" })).toHaveCount(0);
    } finally {
      await hapusIdmTahun(TAHUN_PUBLIK);
    }
  },
);
