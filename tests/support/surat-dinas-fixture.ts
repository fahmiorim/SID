import { randomInt, randomUUID } from "node:crypto";
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
        await pool.execute("DELETE FROM users WHERE id IN (?, ?, ?)", userIds);
        if (jenisId !== null) {
          await pool.execute("DELETE FROM letters WHERE type_id = ?", [jenisId]);
          await pool.execute("DELETE FROM letter_types WHERE id = ?", [jenisId]);
        }
        if (syaratId !== null) {
          await pool.execute("DELETE FROM letter_requirements WHERE id = ?", [syaratId]);
        }
        if (residentId !== null) {
          await pool.execute("DELETE FROM residents WHERE id = ?", [residentId]);
        }
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
    // Pakai desa utama agar role/menu dan akun operator nyata tersedia.
    const adminUsername = process.env.E2E_ADMIN_USERNAME ?? "admin";
    const [adminRows] = await pool.execute<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = ? LIMIT 1",
      [adminUsername],
    );
    desaId = (adminRows[0]?.village_id as number | undefined) ?? null;
    if (desaId === null) throw new Error("Desa akun admin E2E tidak ditemukan.");

    // Create resident
    const [wargaResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO residents (village_id, national_id, name, gender) VALUES (?, ?, ?, ?)",
      [desaId, warga.nik, warga.nama, "male"],
    );
    residentId = wargaResult.insertId;

    const [operatorRoles] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM roles WHERE slug = 'operator' AND village_id = ? LIMIT 1",
      [desaId],
    );
    const operatorRoleId = (operatorRoles[0]?.id as number | undefined) ?? 3;

    // Create operator user
    await pool.execute(
      `INSERT INTO users
       (id, name, email, email_verified, username, display_username, village_id,
        role_id, active, must_change_pin, resident_id)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, 1, 0, ?)`,
      [
        userIds[0],
        `Operator Uji ${run}`,
        `operator-${run}@e2e.invalid`,
        operatorUsername,
        operatorUsername,
        desaId,
        operatorRoleId,
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
    const [suratIdResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letters (village_id, type_id, resident_id, status, number, type_name, letter_date, year, verification_token, content, created_by)
       VALUES (?, ?, ?, 'verifikasi', ?, ?, CURDATE(), YEAR(CURDATE()), UUID(), 'Isi pengujian surat dinas untuk test E2E OS-SUR-011', NULL)`,
      [desaId, jenisId, residentId, "E2E-Surat Dinas", namaJenis],
    );
    if (!suratIdResult.insertId) throw new Error("Gagal membuat surat dinas fixture.");

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
