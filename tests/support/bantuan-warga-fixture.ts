import { randomUUID } from "node:crypto";
import { createPool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

import { buatFixturePermohonanWarga } from "./permohonan-warga-fixture";

export interface BantuanWargaFixture {
  namaBantuan: string;
  wargaNik: string;
  hapus(): Promise<void>;
}

export async function buatFixtureBantuanWarga(): Promise<BantuanWargaFixture> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk E2E bantuan warga.");

  const warga = await buatFixturePermohonanWarga();
  const pool = createPool(dsn);
  const run = randomUUID().slice(0, 8);
  const namaBantuan = `Bantuan Warga E2E ${run}`;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM residents WHERE village_id = ? AND national_id = ? LIMIT 1",
      [warga.desaId, warga.warga.nik],
    );
    const residentId = rows[0]?.id;
    if (typeof residentId !== "number")
      throw new Error("Penduduk fixture bantuan tidak ditemukan.");

    const [program] = await pool.execute<ResultSetHeader>(
      `INSERT INTO bantuan_program (village_id, name, slug, sasaran, description)
       VALUES (?, ?, ?, ?, ?)`,
      [warga.desaId, namaBantuan, `bantuan-e2e-${run}`, 1, "Program bantuan untuk verifikasi E2E."],
    );
    await pool.execute(
      "INSERT INTO bantuan_peserta (village_id, program_id, resident_id) VALUES (?, ?, ?)",
      [warga.desaId, program.insertId, residentId],
    );

    return {
      namaBantuan,
      wargaNik: warga.warga.nik,
      async hapus() {
        await pool.end();
        await warga.hapus();
      },
    };
  } catch (error) {
    await pool.end();
    await warga.hapus();
    throw error;
  }
}
