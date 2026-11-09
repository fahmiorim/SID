import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { createConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

/** Buat program bantuan sementara untuk menguji laporan cetak resmi. */
async function buatProgramCetak(): Promise<{ id: number; nama: string }> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk E2E laporan bantuan.");
  const db = await createConnection(dsn);
  try {
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = users[0]?.village_id as number | undefined;
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");
    const nama = `Program Cetak E2E ${Date.now()}`;
    const [hasil] = await db.execute<ResultSetHeader>(
      "INSERT INTO bantuan_program (village_id, name, slug, sasaran, description) VALUES (?, ?, ?, 1, 'Uji laporan cetak E2E')",
      [villageId, nama, `cetak-e2e-${Date.now()}`],
    );
    return { id: hasil.insertId, nama };
  } finally {
    await db.end();
  }
}

async function hapusProgramCetak(id: number): Promise<void> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) return;
  const db = await createConnection(dsn);
  try {
    await db.execute("DELETE FROM bantuan_program WHERE id = ?", [id]);
  } finally {
    await db.end();
  }
}

// ============================================================================
// OS-POP-010 — Statistik penduduk `/statistik/penduduk`, rentang umur, filter wilayah/umur, ekspor CSV,
// cetak browser, dan ekspor PDF `/statistik/penduduk/ekspor/pdf`. **Ditambah test rute ekspor PDF**
// (mock sesi/use case/repo): menolak tanpa sesi (401), menolak tanpa izin (403), mengembalikan
// `application/pdf` dengan header unduhan dan awalan `%PDF-`, serta memakai `kind` bawaan untuk parameter tak dikenal.
// **Gap: E2E khusus ekspor PDF.** E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "statistik penduduk: halaman utama dan filter umur",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    await expect(browser).toHaveURL("/statistik/penduduk");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Filter umur
    await expect(browser.locator('[name="umurMin"]')).toBeVisible({ timeout: 3000 });
    await expect(browser.locator('[name="umurMax"]')).toBeVisible({ timeout: 3000 });
  },
);

test(
  "statistik penduduk: ekspor PDF berhasil diunduh",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    // Cek header PDF tanpa menavigasi ke berkas unduhan
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);

// ============================================================================
// OS-POP-011 — Program bantuan: CRUD, detail, peserta, ekspor CSV, RBAC. **Cetak via browser**
// ditambahkan di detail program (`/bantuan/[id]`). **Laporan resmi** `/bantuan/[id]/cetak` ber-kop desa
// (identitas program, daftar peserta, kolom tanda tangan) tertaut dari halaman detail.
// **Gap: E2E laporan resmi belum ada.** Test `bantuan.test.ts`; E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "program bantuan: halaman daftar program",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/bantuan");
    await expect(browser).toHaveURL("/bantuan");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Daftar program
    const teks = await browser.locator("body").textContent();
    expect(teks).toMatch(/program/i);
  },
);

test(
  "program bantuan: laporan resmi cetak",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    const program = await buatProgramCetak();
    try {
      await app.open(`/bantuan/${program.id}/cetak`);
      await expect(browser).toHaveURL(`/bantuan/${program.id}/cetak`);
      await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
      const teks = await browser.locator("body").textContent();
      expect(teks).toMatch(/laporan program bantuan sosial/i);
      expect(teks).toContain(program.nama);
      expect(teks).toContain("Kepala Desa");
      expect(teks).toContain("Daftar Peserta");
    } finally {
      await hapusProgramCetak(program.id);
    }
  },
);

// ============================================================================
// OS-POP-013 — Statistik bantuan per program/sasaran, filter wilayah/periode, ekspor CSV, cetak browser,
// dan ekspor PDF `/statistik/bantuan/ekspor/pdf`. Filter **kategori sasaran** kini tersedia di halaman
// dan diteruskan ke ekspor CSV/PDF; tombol Unduh PDF ditautkan ke rute nyata. Hitungan per sasaran
// memakai jumlah peserta (`COUNT(bantuan_peserta.id)`) sehingga program tanpa peserta tidak lagi terhitung.
// **Gap: E2E ekspor PDF.** Test `statistik.test.ts`; E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "statistik bantuan: halaman utama dengan filter kategori sasaran",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan?kind=sasaran");
    await expect(browser).toHaveURL(/\/statistik\/bantuan/);
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Filter kategori sasaran (hanya tampil pada jenis statistik sasaran)
    await expect(browser.locator('[name="sasaran"]')).toBeVisible({ timeout: 3000 });
  },
);

test(
  "statistik bantuan: ekspor PDF berhasil diunduh",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);
