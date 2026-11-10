import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatSurveiDenganSoalUji,
  hapusIndikatorAnalisisDariKode,
  hapusKategoriAnalisisDariNama,
  hapusSurveyDariJudul,
} from "./support/database";

function unik(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

/**
 * Katalog: OS-ANA-001 — Kategori analisis: tambah, ubah, dan hapus.
 */
test(
  "kategori analisis: tambah, ubah, lalu hapus",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const nama = `Kategori E2E ${unik()}`;

    try {
      await app.open("/analisis");
      await expect(screen.getByRole("heading", { name: "Analisis" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Kategori" }).tap();
      await screen.getByLabel("Nama kategori").fill(nama);
      await screen.getByLabel("Keterangan").fill("Kategori uji E2E");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Kategori berhasil ditambahkan.")).toBeVisible();
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      await screen.getByRole("button", { name: `Ubah kategori ${nama}` }).tap();
      await screen.getByLabel("Nama kategori").fill(`${nama} ubah`);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Kategori berhasil diperbarui.")).toBeVisible();
      await expect(screen.getByRole("cell", { name: `${nama} ubah`, exact: true })).toBeVisible();

      await screen.getByRole("button", { name: `Hapus kategori ${nama} ubah` }).tap();
      await expect(screen.getByRole("cell", { name: `${nama} ubah`, exact: true })).toHaveCount(0);
    } finally {
      await hapusKategoriAnalisisDariNama(nama);
      await hapusKategoriAnalisisDariNama(`${nama} ubah`);
    }
  },
);

/**
 * Katalog: OS-ANA-002 — Indikator analisis: kode, nama, kategori, dan bobot 1–100.
 */
test(
  "indikator analisis: tambah dengan kategori dan bobot lalu hapus",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const kode = `IND${unik().replace("-", "").slice(0, 8)}`;
    const nama = `Indikator E2E ${kode}`;

    try {
      await app.open("/analisis");
      await screen.getByRole("button", { name: "Tambah Indikator" }).tap();
      await screen.getByLabel("Kode").fill(kode);
      await screen.getByLabel("Nama indikator").fill(nama);
      await screen.getByLabel("Bobot (1–100)").fill("50");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Indikator berhasil ditambahkan.")).toBeVisible();
      await expect(screen.getByRole("cell", { name: kode, exact: true })).toBeVisible();
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      await screen.getByRole("button", { name: `Hapus indikator ${kode}` }).tap();
      await expect(screen.getByRole("cell", { name: kode, exact: true })).toHaveCount(0);
    } finally {
      await hapusIndikatorAnalisisDariKode(kode);
    }
  },
);

/**
 * Katalog: OS-ANA-003 — Survei: sasaran dan periode pada form, status di daftar.
 */
test(
  "survei: buat survei dengan sasaran dan periode",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const judul = `Survei E2E ${unik()}`;

    try {
      await app.open("/analisis-survei");
      await expect(screen.getByRole("heading", { name: "Analisis & Survei" })).toBeVisible();

      await screen.getByRole("button", { name: "Buat Survei" }).tap();
      await screen.getByLabel("Judul").fill(judul);
      await screen.getByLabel("Sasaran responden").fill("Warga usia produktif");
      await screen.getByLabel("Mulai pengisian").fill("2026-01-01");
      await screen.getByLabel("Akhir pengisian").fill("2026-12-31");
      await screen.getByRole("button", { name: "Buat survei" }).tap();

      const baris = screen.getByRole("row").filter({ hasText: judul });
      await expect(baris).toBeVisible();
      await expect(baris.getByText("Aktif", { exact: true })).toBeVisible();
    } finally {
      await hapusSurveyDariJudul(judul);
    }
  },
);

/**
 * Katalog: OS-ANA-004/005 — Detail survei: soal, responden publik, rekap, dan token embed.
 */
test(
  "survei: pertanyaan dijawab warga lalu muncul di rekap admin",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const judul = `Survei Detail E2E ${unik()}`;

    try {
      await app.open("/analisis-survei");
      await screen.getByRole("button", { name: "Buat Survei" }).tap();
      await screen.getByLabel("Judul").fill(judul);
      await screen.getByRole("button", { name: "Buat survei" }).tap();
      await expect(screen.getByRole("row").filter({ hasText: judul })).toBeVisible();

      await screen.getByRole("link", { name: judul }).tap();
      await expect(screen.getByRole("heading", { name: judul })).toBeVisible();
      await expect(screen.getByText("Ekspor & Impor Respons")).toBeVisible();
      await expect(screen.getByText("Embed di Situs Lain")).toBeVisible();
      await expect(screen.getByRole("button", { name: "Salin kode embed" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Pertanyaan" }).tap();
      await screen.getByLabel("Pertanyaan").fill("Bagaimana kepuasan pelayanan desa?");
      await screen.getByLabel("Tipe jawaban").tap();
      await screen.getByRole("option", { name: /pilihan ganda/i }).tap();
      await screen.getByLabel("Pilihan jawaban").fill("Puas\nTidak puas");
      await screen.getByLabel("Skor pilihan (0–5)").fill("Puas=5\nTidak puas=1");
      await screen.getByRole("button", { name: "Tambah pertanyaan" }).tap();
      await expect(screen.getByText("Pertanyaan ditambahkan.")).toBeVisible();

      const url = await browser.url();
      const surveyId = url.split("/analisis-survei/")[1]?.split("/")[0];

      // Daftar admin menghitung soal dan responden dari tabel anak, bukan 0.
      await app.open("/analisis-survei");
      const barisAwal = screen.getByRole("row").filter({ hasText: judul });
      await expect(barisAwal.getByRole("cell", { name: "1", exact: true })).toHaveCount(1);
      await expect(barisAwal.getByRole("cell", { name: "0", exact: true })).toHaveCount(1);

      // Warga mengisi survei dari halaman publik.
      await app.open(`/desa/analisis-survei/${surveyId}/isi`);
      await expect(screen.getByRole("heading", { name: judul })).toBeVisible();
      await screen.getByLabel("Nama (Opsional)").fill("Warga Survey E2E");
      await screen.getByLabel("Puas").tap();
      await screen.getByRole("button", { name: "Kirim Jawaban" }).tap();
      await expect(screen.getByText(/terima kasih|berhasil/i).first()).toBeVisible();

      // Admin melihat jawaban masuk di rekap.
      await app.open(`/analisis-survei/${surveyId}`);
      await expect(screen.getByText("Warga Survey E2E")).toBeVisible();
      await expect(screen.getByText("Rekap Jawaban")).toBeVisible();

      // Setelah ada responden, daftar admin menampilkan 1 soal dan 1 responden.
      await app.open("/analisis-survei");
      const barisSetelah = screen.getByRole("row").filter({ hasText: judul });
      await expect(barisSetelah.getByRole("cell", { name: "1", exact: true })).toHaveCount(2);
      await expect(barisSetelah.getByRole("cell", { name: "0", exact: true })).toHaveCount(0);

      // Laporan skor formal merangkum responden yang baru mengisi.
      await app.open(`/analisis-survei/${surveyId}/laporan`);
      await expect(browser.locator("h1")).toContainText(`Laporan Skor: ${judul}`);
      await expect(screen.getByText("Responden", { exact: true })).toBeVisible();
      await expect(screen.getByText("Rata-rata Skor", { exact: true })).toBeVisible();
      await expect(screen.getByText("Distribusi Klasifikasi", { exact: true })).toBeVisible();
      await expect(screen.getByText("Skor per Responden", { exact: true })).toBeVisible();
      await expect(
        screen.getByRole("cell", { name: "Warga Survey E2E", exact: true }),
      ).toBeVisible();

      // Ekspor CSV laporan membawa responden yang sama.
      const csv = await browser.evaluate(async (id: string) => {
        const respons = await fetch(`/analisis-survei/${id}/laporan/ekspor`);
        return {
          status: respons.status,
          tipe: respons.headers.get("content-type") ?? "",
          body: await respons.text(),
        };
      }, surveyId as string);
      expect(csv.status).toBe(200);
      expect(csv.body).toContain("Warga Survey E2E");
    } finally {
      await hapusSurveyDariJudul(judul);
    }
  },
);

/**
 * Katalog: OS-ANA-004 — Ekspor laporan menolak id survei tidak valid.
 */
test("ekspor CSV survei menolak id tidak valid", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/analisis-survei");
  const hasil = await browser.evaluate(async () => {
    const laporan = await fetch("/analisis-survei/0/laporan/ekspor");
    const skor = await fetch("/analisis-survei/0/ekspor");
    return {
      laporan: { status: laporan.status, body: await laporan.text() },
      skor: { status: skor.status, body: await skor.text() },
    };
  });
  expect(hasil.laporan.status).toBe(400);
  expect(hasil.laporan.body).toContain("tidak valid");
  expect(hasil.skor.status).toBe(400);
  expect(hasil.skor.body).toContain("tidak valid");
});

/**
 * Katalog: OS-ANA-005 — Endpoint formulir eksternal menolak permintaan tanpa token.
 */
test("endpoint publik survei menolak tanpa token", async ({ app, browser }) => {
  await app.open("/desa/analisis-survei");
  const hasil = await browser.evaluate(async () => {
    const respons = await fetch("/api/publik/survei/1/respons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jawaban: { jawaban1: "pilihA" } }),
    });
    return { status: respons.status, body: await respons.text() };
  });
  expect(hasil.status).toBe(401);
  expect(hasil.body).toMatch(/token/i);
});

/**
 * Katalog: OS-ANA-005 — Jalur sukses formulir eksternal bertoken.
 *
 * Token dibaca dari kartu "Embed di Situs Lain" di halaman admin, seperti
 * yang ditempel operator ke situs pihak ketiga, lalu dipakai mengirim respons
 * lewat `POST /api/publik/survei/[id]/respons`. Jawaban diverifikasi dari
 * daftar responden di halaman admin, bukan hanya dari status HTTP.
 */
test(
  "formulir eksternal: token dari halaman admin menerima respons lewat API",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const judul = `Survei Form Eksternal E2E ${unik()}`;
    const survei = await buatSurveiDenganSoalUji({
      judul,
      pertanyaan: "Bagaimana pelayanan desa?",
      pilihan: ["Puas", "Tidak puas"],
    });

    try {
      await app.open(`/analisis-survei/${survei.id}`);
      await expect(screen.getByText("Embed di Situs Lain")).toBeVisible();

      const token = (await browser.locator("code.break-all").textContent())?.trim() ?? "";
      expect(token.length).toBeGreaterThan(10);

      const hasil = await browser.evaluate(
        async (data: { id: number; token: string; soalId: number }) => {
          const kirim = await fetch(`/api/publik/survei/${data.id}/respons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: data.token,
              nama: "Warga Form Eksternal E2E",
              jawaban: { [String(data.soalId)]: "Puas" },
            }),
          });
          return { status: kirim.status, body: await kirim.json() };
        },
        { id: survei.id, token, soalId: survei.soalId },
      );

      expect(hasil.status).toBe(201);
      expect(hasil.body.success).toBe(true);

      // Respons yang dikirim lewat API benar-benar tersimpan di survei ini.
      await app.open(`/analisis-survei/${survei.id}`);
      await expect(screen.getByText("Warga Form Eksternal E2E")).toBeVisible({
        timeout: 10_000,
      });
    } finally {
      await hapusSurveyDariJudul(judul);
    }
  },
);

/**
 * Katalog: OS-ANA-006 — Halaman publik daftar survei dapat diakses.
 */
test("survei publik: daftar survei dapat diakses", async ({ app, browser }) => {
  await app.open("/desa/analisis-survei");
  await expect(browser.locator("h1")).toContainText("Survei");
});
