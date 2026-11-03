import { randomInt, randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import { hashPassword } from "better-auth/crypto";
import { createPool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

interface AdminRoleRow extends RowDataPacket {
  role_id: number | null;
}

export interface PermohonanWargaFixture {
  namaJenis: string;
  syaratNama: string;
  jenisId: number;
  desaId: number;
  operatorUsername: string;
  warga: { nama: string; nik: string };
  wargaLain: { nik: string };
  hapus(): Promise<void>;
}

function nikUji(): string {
  return `3201${Array.from({ length: 12 }, () => randomInt(0, 10)).join("")}`;
}

export async function buatFixturePermohonanWarga(): Promise<PermohonanWargaFixture> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk E2E permohonan warga.");
  const pin = process.env.E2E_WARGA_PASSWORD ?? "TestWarga#12345";

  const pool = createPool(dsn);
  const run = randomUUID().slice(0, 8);
  const namaJenis = `Surat Uji E2E ${run}`;
  const syaratNama = `Berkas Uji E2E ${run}`;
  const warga = { nama: `Warga Uji ${run}`, nik: nikUji() };
  const wargaLain = { nik: nikUji() };
  const userIds = [randomUUID(), randomUUID(), randomUUID()];
  const operatorUsername = `e2e-${run}`;
  const adminUsername = process.env.E2E_ADMIN_USERNAME ?? "admin";
  let desaId: number | null = null;
  let syaratId: number | null = null;
  let jenisId: number | null = null;
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

  try {
    const [adminRows] = await pool.execute<AdminRoleRow[]>(
      "SELECT role_id FROM users WHERE username = ? LIMIT 1",
      [adminUsername],
    );
    const operatorRoleId = adminRows[0]?.role_id;
    if (!operatorRoleId) throw new Error("Role akun admin E2E tidak ditemukan.");

    const [desaResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code) VALUES (?, ?)",
      [`Desa Uji E2E ${run}`, `E${run}`],
    );
    desaId = desaResult.insertId;

    const [wargaResult, wargaLainResult] = await Promise.all([
      pool.execute<ResultSetHeader>(
        "INSERT INTO residents (village_id, national_id, name, gender) VALUES (?, ?, ?, ?)",
        [desaId, warga.nik, warga.nama, "male"],
      ),
      pool.execute<ResultSetHeader>(
        "INSERT INTO residents (village_id, national_id, name, gender) VALUES (?, ?, ?, ?)",
        [desaId, wargaLain.nik, `Warga Lain ${run}`, "female"],
      ),
    ]);
    const residentIds = [wargaResult[0].insertId, wargaLainResult[0].insertId];
    const passwordHash = await hashPassword(pin);

    for (const [index, residentId] of residentIds.entries()) {
      const userId = userIds[index];
      if (!userId) throw new Error("ID akun uji tidak tersedia.");
      const username = index === 0 ? warga.nik : wargaLain.nik;
      const email = `warga-${run}-${index}@e2e.invalid`;

      await pool.execute(
        `INSERT INTO users
          (id, name, email, email_verified, username, display_username, village_id,
           role_id, active, must_change_pin, resident_id)
         VALUES (?, ?, ?, 1, ?, ?, ?, NULL, 1, 0, ?)`,
        [
          userId,
          index === 0 ? warga.nama : `Warga Lain ${run}`,
          email,
          username,
          username,
          desaId,
          residentId,
        ],
      );
      await pool.execute(
        `INSERT INTO accounts (id, account_id, provider_id, user_id, password)
         VALUES (?, ?, 'credential', ?, ?)`,
        [randomUUID(), userId, userId, passwordHash],
      );
    }
    const operatorId = userIds[2];
    if (!operatorId) throw new Error("ID akun operator uji tidak tersedia.");
    await pool.execute(
      `INSERT INTO users
        (id, name, email, email_verified, username, display_username, village_id,
         role_id, active, must_change_pin, resident_id)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, 1, 0, NULL)`,
      [
        operatorId,
        `Operator Uji ${run}`,
        `operator-${run}@e2e.invalid`,
        operatorUsername,
        operatorUsername,
        desaId,
        operatorRoleId,
      ],
    );
    await pool.execute(
      `INSERT INTO accounts (id, account_id, provider_id, user_id, password)
       VALUES (?, ?, 'credential', ?, ?)`,
      [randomUUID(), operatorId, operatorId, passwordHash],
    );

    const [syaratResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO letter_requirements (village_id, name, description) VALUES (?, ?, ?)",
      [desaId, syaratNama, "Berkas dummy untuk pengujian otomatis."],
    );
    syaratId = syaratResult.insertId;

    const [jenisResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letter_types
        (village_id, code, name, template_body, syarat_surat, requires_resident, is_active)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [
        desaId,
        `E2E${run.slice(0, 6)}`,
        namaJenis,
        `<p>Surat uji untuk ${warga.nama}.</p>`,
        JSON.stringify([syaratId]),
      ],
    );
    jenisId = jenisResult.insertId;

    return {
      namaJenis,
      syaratNama,
      jenisId,
      operatorUsername,
      desaId,
      warga,
      wargaLain,
      hapus,
    };
  } catch (error) {
    await hapus();
    throw error;
  }
}
