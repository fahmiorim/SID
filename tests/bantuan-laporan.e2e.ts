import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { createConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_PORT = Number(process.env.DB_PORT ?? 3306);
const DB_USER = process.env.DB_USER ?? "root";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME ?? "desa_dev";

/** Buat program bantuan sementara untuk menguji laporan cetak/ekspor/impor. */
async function buatProgramLaporan(): Promise<{ id: number; slug: string; nama: string }> {
  const conn = await createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  const timestamp = Date.now();
  const slug = `program-laporan-$${timestamp}`;
  const nama = `Program Laporan $${timestamp}`;
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO bantuan_program (village_id, name, slug, sasaran, asal_dana, start_date, end_date)
     VALUES (1, ?, ?, 1, 1, '2024-01-01', '2024-12-31')`,
    [nama, slug],
  );
  await conn.end();
  return { id: result.insertId, slug, nama };
}

/** Hapus program bantuan beserta pesertanya. */
async function hapusProgramLaporan(id: number): Promise<void> {
  const conn = await createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  await conn.execute(`DELETE FROM bantuan_peserta WHERE program_id = ?`, [id]);
  await conn.execute(`DELETE FROM bantuan_program WHERE id = ?`, [id]);
  await conn.end();
}

/** Tambahkan satu peserta ke program (via DB langsung agar cepat). */
async function tambahPeserta(programId: number, _nama: string): Promise<number> {
  const conn = await createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  const [penduduk] = await conn.execute<RowDataPacket[]>(
    `SELECT id, national_id FROM residents WHERE village_id = 1 AND life_status = 'alive' LIMIT 1`,
  );
  await conn.end();
  if (penduduk.length === 0) throw new Error("Tidak ada penduduk untuk fixture");

  const conn2 = await createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  const [result] = await conn2.execute<ResultSetHeader>(
    `INSERT INTO bantuan_peserta (village_id, program_id, resident_id, card_number)
     VALUES (1, ?, ?, ?)`,
    [programId, penduduk[0].id, `KARTU-$${Date.now()}`],
  );
  await conn2.end();
  return result.insertId;
}

/** Ambil nama desa dari seed (village_id=1). */
async function ambilNamaDesa(): Promise<string> {
  const conn = await createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  const [rows] = await conn.execute<RowDataPacket[]>(`SELECT name FROM villages WHERE id = 1`);
  await conn.end();
  return rows[0]?.name ?? "Desa";
}

// ============================================================================
// OS-POP-011 — Program bantuan: CRUD, detail, peserta, ekspor CSV, RBAC.
// **Cetak via browser** ditambahkan di detail program (`/bantuan/[id]`).
// **Laporan resmi** `/bantuan/[id]/cetak` ber-kop desa (identitas program,
// daftar peserta, kolom tanda tangan) tertaut dari halaman detail.
// **Gap: E2E laporan resmi belum ada.** Test `bantuan.test.ts`; E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "OS-POP-011: laporan resmi cetak — kop desa, identitas program, peserta, kolom tanda tangan",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    const program = await buatProgramLaporan();
    try {
      await tambahPeserta(program.id, `Peserta-$${Date.now()}`);

      await app.open(`/bantuan/$${program.id}/cetak`);
      await expect(browser).toHaveURL(`/bantuan/$${program.id}/cetak`);
      await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });

      const teks = await browser.locator("body").textContent();
      if (!teks) throw new Error("Body kosong");

      // Kop desa (nama desa dari seed)
      const namaDesa = await ambilNamaDesa();
      expect(teks).toContain(namaDesa);

      // Identitas program
      expect(teks).toContain(program.nama);

      // Daftar Peserta
      expect(teks).toMatch(/daftar peserta/i);

      // Kolom tanda tangan (Kepala Desa / Sekretaris Desa)
      expect(teks).toMatch(/kepala desa/i);
    } finally {
      await hapusProgramLaporan(program.id);
    }
  },
);

test(
  "OS-POP-011: ekspor CSV program bantuan — mengembalikan text/csv memuat nama peserta",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    const program = await buatProgramLaporan();
    try {
      const namaPeserta = `Peserta-$${Date.now()}`;
      await tambahPeserta(program.id, namaPeserta);

      await app.open("/bantuan");
      // Endpoint ekspor CSV: /bantuan/ekspor?programId=<id>
      const cd = await browser.evaluate(async (id) => {
        const res = await fetch(`/bantuan/ekspor?programId=$${id}`);
        return {
          status: res.status,
          contentType: res.headers.get("content-type"),
          body: await res.text(),
        };
      }, program.id);

      expect(cd.status).toBe(200);
      expect(cd.contentType).toContain("text/csv");
      expect(cd.body).toContain(namaPeserta);
    } finally {
      await hapusProgramLaporan(program.id);
    }
  },
);

// ============================================================================
// OS-POP-012 — Peserta bantuan: kandidat sasaran tenant-aware, snapshot kartu,
// ubah kartu, ekspor CSV, pembersihan massal, dan cetak kartu lewat
// `window.print()`. **Impor peserta** CSV/XLSX via `PesertaImportDialog` +
// `imporPesertaAction` dengan kolom identitas per sasaran (NIK / No. KK /
// No. RTM / kode kelompok), unduh template, dan domain `impor-peserta.ts` +
// test (kode ganda, tidak ditemukan, sudah terdaftar).
// **Gap: E2E impor peserta.** Test `bantuan.test.ts`; E2E detail `/bantuan/999999`.
// ============================================================================
test(
  "OS-POP-012: impor peserta CSV — peserta hasil impor muncul di daftar",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    const program = await buatProgramLaporan();
    try {
      // Buka halaman detail program
      await app.open(`/bantuan/$${program.id}`);

      // Buka dialog impor (tombol "Impor Peserta")
      await browser.locator('button:has-text("Impor Peserta")').tap();

      // Tunggu dialog terbuka
      await expect(browser.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

      // Buat CSV sederhana dengan header yang sesuai (sasaran=1 → penduduk, kolom NIK)
      // Template: sasaran,nomorKartu,namaKartu
      // Gunakan NIK penduduk yang ada di database
      const conn = await createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
      });
      const [penduduk] = await conn.execute<RowDataPacket[]>(
        `SELECT national_id FROM residents WHERE village_id = 1 AND life_status = 'alive' LIMIT 1`,
      );
      await conn.end();
      if (penduduk.length === 0) throw new Error("Tidak ada penduduk untuk fixture");

      const csvContent = `sasaran,nomorKartu,namaKartu\n1,$$${penduduk[0].national_id},IMPORT-$${Date.now()}\n`;

      // Upload file via input[type=file] di dialog
      const fileHandle = await browser.evaluate(async (csv) => {
        const file = new File([csv], "peserta-import.csv", { type: "text/csv" });
        const dt = new DataTransfer();
        dt.items.add(file);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.files = dt.files;
        return input?.files?.length ?? 0;
      }, csvContent);

      expect(fileHandle).toBeGreaterThan(0);

      // Submit form impor (tombol "Impor" di dialog)
      await browser.locator('[role="dialog"] button:has-text("Impor")').tap();

      // Tunggu toast sukses atau tutup dialog
      await expect(browser.locator('[role="dialog"]')).toBeHidden({ timeout: 10000 });

      // Verifikasi peserta hasil impor muncul di tabel
      const teks = await browser.locator("body").textContent();
      expect(teks).toContain("IMPORT-");
    } finally {
      await hapusProgramLaporan(program.id);
    }
  },
);

test(
  "OS-POP-012: impor peserta CSV — baris NIK tak dikenal dilaporkan dialog sebagai gagal",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    const program = await buatProgramLaporan();
    try {
      await app.open(`/bantuan/$${program.id}`);
      await browser.locator('button:has-text("Impor Peserta")').tap();
      await expect(browser.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

      // CSV dengan NIK yang tidak ada di desa
      const csvContent = `sasaran,nomorKartu,namaKartu\n1,9999999999999999,NIK-TIDAK-ADA\n`;

      await browser.evaluate(async (csv) => {
        const file = new File([csv], "peserta-import-invalid.csv", { type: "text/csv" });
        const dt = new DataTransfer();
        dt.items.add(file);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.files = dt.files;
      }, csvContent);

      await browser.locator('[role="dialog"] button:has-text("Impor")').tap();

      // Tunggu pesan error muncul di dialog (bukan toast global)
      const errorVisible = await browser
        .locator('[role="dialog"] :text("tidak ditemukan")')
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Atau pesan error bisa jadi "NIK tidak ditemukan" / "Kode tidak dikenali"
      const errorVisible2 = await browser
        .locator('[role="dialog"] :text("tidak dikenali")')
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Minimal salah satu pesan error harus muncul
      expect(errorVisible || errorVisible2).toBe(true);
    } finally {
      await hapusProgramLaporan(program.id);
    }
  },
);
