import { randomInt, randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import { createPool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

interface LetterRow extends RowDataPacket {
  id: number;
  number: string | null;
  status: string;
  verification_token: string | null;
}

export interface SuratDinasE2EFixture {
  namaJenis: string;
  syaratNama: string;
  jenisId: number;
  desaId: number;
  operatorUsername: string;
  warga: { nama: string; nik: string };
  ambilSuratTerbit(): Promise<{
    id: number;
    number: string | null;
    verificationToken: string;
  } | null>;
  hapus(): Promise<void>;
}

function nikUji(): string {
  return `3201${Array.from({ length: 12 }, () => randomInt(0, 10)).join("")}`;
}

export async function buatFixtureSuratDinas(): Promise<SuratDinasE2EFixture> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk E2E surat dinas.");

  const pool = createPool(dsn);
  const run = randomUUID().slice(0, 8);
  const namaJenis = `Surat Dinas E2E ${run}`;
  const syaratNama = `Berkas Uji E2E ${run}`;
  const warga = { nama: `Warga Uji ${run}`, nik: nikUji() };
  const userIds = [randomUUID(), randomUUID(), randomUUID()];
  const operatorUsername = `e2e-surat-dinas-${run}`;
  let desaId: number | null = null;
  let syaratId: number | null = null;
  let jenisId: number | null = null;
  let residentId: number | null = null;
  let sudahDihapus = false;

  async function hapus(): Promise<void> {
    if (sudahDihapus) return;
    sudahDihapus = true;
    try {
      if (desaId !== null) {
        await rm(path.join(process.cwd(), "storage", "media", String(desaId)), {
          recursive: true,
          force: true,
        });
        await pool.execute("DELETE FROM users WHERE id IN (?, ?, ?)", userIds);
        if (jenisId !== null) {
          await pool.execute("DELETE FROM letters WHERE type_id = ?", [jenisId]);
        }
        await pool.execute("DELETE FROM villages WHERE id = ?", [desaId]);
      }
    } finally {
      await pool.end();
    }
  }

  async function ambilSuratTerbit(): Promise<{
    id: number;
    number: string | null;
    verificationToken: string;
  } | null> {
    if (desaId === null || jenisId === null) return null;
    const [rows] = await pool.execute<LetterRow[]>(
      `SELECT id, number, verification_token FROM letters WHERE village_id = ? AND type_id = ? AND status = 'issued' ORDER BY id DESC LIMIT 1`,
      [desaId, jenisId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      number: row.number,
      verificationToken: row.verification_token,
    };
  }

  try {
    // Create village
    const [desaResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code) VALUES (?, ?)",
      [`Desa Surat Dinas E2E ${run}`, `SD${run}`],
    );
    desaId = desaResult.insertId;

    // Create resident
    const [wargaResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO residents (village_id, national_id, name, gender) VALUES (?, ?, ?, ?)",
      [desaId, warga.nik, warga.nama, "male"],
    );
    residentId = wargaResult[0].insertId;

    // Create operator user
    await pool.execute(
      `INSERT INTO users
       (id, name, email, email_verified, username, display_username, village_id,
        role_id, active, must_change_pin, resident_id)
       VALUES (?, ?, 1, ?, ?, ?, ?, NULL, 1, 0, ?)`,
      [
        userIds[0],
        `Operator Uji ${run}`,
        `operator-${run}@e2e.invalid`,
        operatorUsername,
        operatorUsername,
        desaId,
        3, // operator role
        residentId,
      ],
    );

    // Insert syarat surat
    const [syaratResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO letter_requirements (village_id, name, description) VALUES (?, ?, ?)",
      [desaId, syaratNama, "Berkas dummy untuk pengujian otomatis."],
    );
    syaratId = syaratResult.insertId;

    // Insert jenis surat dinas (butuh classification_id)
    const [jenisResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letter_types
       (village_id, code, name, template_body, syarat_surat, requires_resident, is_active)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [
        desaId,
        `SD${run.slice(0, 6)}`,
        namaJenis,
        `<p>Surat uji untuk ${warga.nama}.</p>`,
        JSON.stringify([syaratId]),
      ],
    );
    jenisId = jenisResult.insertId;

    // Insert surat dinas
    await pool.execute(
      `INSERT INTO letters (village_id, type_id, resident_id, status, number, letter_date, verification_token, content, created_by)
       VALUES (?, ?, ?, 'verifikasi', ?, CURDATE(), UUID(), 'Isi pengujian surat dinas untuk test E2E OS-SUR-011', ?)`,
      [desaId, jenisId, residentId, "E2E-Surat Dinas", run],
    );
    const [suratIdResult] = await pool.execute<ResultSetHeader>("SELECT LAST_INSERT_ID()");
    const suratMasukId = suratIdResult.insertId;

    // Insert nilai isian (pengikut)
    await pool.execute(
      `INSERT INTO nilai_isian (letter_id, field_key, field_value) VALUES (?, ?, ?)`,
      [suratMasukId, "pengikut1_nama", warga.nama],
    );

    return {
      namaJenis,
      syaratNama,
      jenisId,
      operatorUsername,
      desaId,
      warga,
      ambilSuratTerbit,
      hapus,
    };
  } catch (error) {
    await hapus();
    throw error;
  }
}
