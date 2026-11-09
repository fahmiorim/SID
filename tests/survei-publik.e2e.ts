import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-ANA-006 — Halaman publik survei aktif & pengisian mandiri.
// ============================================================================
test(
  "survei publik: daftar survei aktif dapat diakses",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/analisis-survei");
    await expect(browser).toHaveURL("/desa/analisis-survei");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 10_000 });
  },
);

test("survei publik: buka halaman isi survei aktif & verifikasi form", async ({
  app,
  screen,
  browser,
}) => {
  await app.open("/desa/analisis-survei/1/isi");
  await expect(browser.locator("h1")).toContainText("Survei", { timeout: 10_000 });
  await expect(screen.getByLabel("Nama (Opsional)")).toBeVisible();
  await expect(screen.getByLabel("NIK (Opsional)")).toBeVisible();
});

// ============================================================================
// OS-ANA-004+006 — Alur penuh.
// ============================================================================
test(
  "survei alur penuh: admin buat survei+soal, publik isi, admin rekap+laporan+ekspor",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    const stamp = Date.now();
    const judul = `Survei E2E Full ${stamp}`;

    // 1. Admin buat survei
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: "Analisis & Survei" })).toBeVisible();

    await screen.getByRole("button", { name: "Buat Survei" }).tap();
    await screen.getByLabel("Judul").fill(judul);
    await screen.getByLabel("Sasaran responden").fill("Warga usia produktif");
    await screen.getByLabel("Mulai pengisian").fill("2026-01-01");
    await screen.getByLabel("Akhir pengisian").fill("2026-12-31");
    await screen.getByRole("button", { name: "Buat survei" }).tap();

    const barisSurvei = screen.getByRole("row").filter({ hasText: judul });
    await expect(barisSurvei).toBeVisible({ timeout: 10_000 });

    // 2. Buka detail survei & tambah soal
    await screen.getByRole("link", { name: judul }).tap();
    await expect(screen.getByRole("heading", { name: judul })).toBeVisible({ timeout: 10_000 });

    // Tambah soal pilihan (choice)
    const soalPilihan = `Pertanyaan Pilihan ${stamp}`;
    await screen.getByRole("button", { name: "Tambah Pertanyaan" }).tap();
    await screen.getByLabel("Pertanyaan").fill(soalPilihan);
    await screen.getByLabel("Tipe jawaban").tap();
    await screen.getByRole("option", { name: "Pilihan Ganda" }).tap();
    await screen.getByLabel("Bobot").fill("2");
    await screen.getByLabel("Pilihan jawaban").fill("Setuju\nNetral\nTidak setuju");
    await screen.getByLabel("Skor pilihan (0–5)").fill("Setuju=5\nNetral=3\nTidak setuju=1");
    await screen.getByRole("button", { name: "Tambah pertanyaan" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Pertanyaan" })).not.toBeVisible();
    await expect(screen.getByRole("list").getByText(soalPilihan)).toBeVisible({ timeout: 10_000 });

    // Tambah soal angka (number)
    const soalAngka = `Pertanyaan Angka ${stamp}`;
    await screen.getByRole("button", { name: "Tambah Pertanyaan" }).tap();
    await screen.getByLabel("Pertanyaan").fill(soalAngka);
    await screen.getByLabel("Tipe jawaban").tap();
    await screen.getByRole("option", { name: "Angka" }).tap();
    await screen.getByLabel("Bobot").fill("1");
    await screen.getByRole("button", { name: "Tambah pertanyaan" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Pertanyaan" })).not.toBeVisible();
    await expect(screen.getByRole("list").getByText(soalAngka)).toBeVisible({ timeout: 10_000 });

    // 3. Publik isi survei
    const surveiIdMatch = await browser.evaluate(async () => {
      const url = window.location.href;
      const match = url.match(/\/analisis-survei\/(\d+)/);
      return match ? Number(match[1]) : null;
    });
    expect(surveiIdMatch).toBeGreaterThan(0);
    const surveiId = surveiIdMatch!;
    const namaResponden = `Responden E2E ${stamp}`;
    await screen.getByLabel("Nama (Opsional)").fill(namaResponden);
    await screen.getByRole("radio", { name: "Setuju" }).tap();
    await screen.getByLabel(soalAngka).fill("42");

    await screen.getByRole("button", { name: "Kirim Jawaban" }).tap();
    await expect(screen.getByText(/terima kasih/i)).toBeVisible({ timeout: 10_000 });

    // 4. Kembali ke admin: detail survei
    await app.open(`/analisis-survei/${surveiId}`);
    await expect(screen.getByRole("heading", { name: judul })).toBeVisible({ timeout: 10_000 });

    await expect(screen.getByText("Rekap Jawaban")).toBeVisible();
    await expect(screen.getByText(soalPilihan)).toBeVisible();
    await expect(screen.getByText(soalAngka)).toBeVisible();

    // 5. Buka laporan skor
    await app.open(`/analisis-survei/${surveiId}/laporan`);
    await expect(screen.getByRole("heading", { name: `Laporan Skor: ${judul}` })).toBeVisible({
      timeout: 10_000,
    });

    await expect(screen.getByText("Skor per Responden")).toBeVisible();
    await expect(screen.getByText(namaResponden)).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByText("Analisis per Indikator")).toBeVisible();
    await expect(screen.getByText("Ringkasan per Kategori")).toBeVisible();

    // 6. Ekspor CSV laporan
    const hasilEkspor = await browser.evaluate(async (id) => {
      const respons = await fetch(`/analisis-survei/${id}/laporan/ekspor`);
      const contentType = respons.headers.get("content-type") || "";
      const text = await respons.text();
      return { status: respons.status, contentType, body: text };
    }, surveiId);

    expect(hasilEkspor.status).toBe(200);
    expect(hasilEkspor.contentType).toContain("text/csv");
  },
);

// ============================================================================
// OS-ANA-005 — Embed token + iframe card.
// ============================================================================
test(
  "survei embed: kartu embed menampilkan token & iframe snippet",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    await app.open("/analisis-survei");
    const judul = `Survei Embed ${Date.now()}`;

    await screen.getByRole("button", { name: "Buat Survei" }).tap();
    await screen.getByLabel("Judul").fill(judul);
    await screen.getByRole("button", { name: "Buat survei" }).tap();

    const baris = screen.getByRole("row").filter({ hasText: judul });
    await expect(baris).toBeVisible({ timeout: 10_000 });
    await screen.getByRole("link", { name: judul }).tap();
    await expect(screen.getByRole("heading", { name: judul })).toBeVisible({ timeout: 10_000 });

    await expect(screen.getByText("Embed di Situs Lain")).toBeVisible();
    await expect(screen.getByText(/Token API/i)).toBeVisible();

    const token = await browser.evaluate(() => {
      const code = document.querySelector('code[class*="break-all"]');
      return code?.textContent?.trim() ?? "";
    });

    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);

    const surveiId = await browser.evaluate(() => {
      const url = window.location.href;
      const match = url.match(/\/analisis-survei\/(\d+)/);
      return match ? Number(match[1]) : null;
    });
    expect(surveiId).toBeGreaterThan(0);

    // a) Tanpa token ditolak
    const tanpaToken = await browser.evaluate(async (id) => {
      const respons = await fetch(`/api/publik/survei/${id}/respons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jawaban: {} }),
      });
      return { status: respons.status, body: await respons.text() };
    }, surveiId);

    expect(tanpaToken.status).toBe(401);

    // b) Dengan token
    const denganToken = await browser.evaluate(
      async ({ id, token }) => {
        const respons = await fetch(`/api/publik/survei/${id}/respons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            nama: "API Responden",
            nik: "1234567890123456",
            jawaban: {},
          }),
        });
        return { status: respons.status, body: await respons.text() };
      },
      { id: surveiId, token },
    );
    expect([201, 400, 422]).toContain(denganToken.status);
  },
);
