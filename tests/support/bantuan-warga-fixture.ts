import { randomUUID } from "node:crypto";
import { createPool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

import { buatFixturePermohonanWarga } from "./permohonan-warga-fixture";

export interface BantuanWargaFixture {
  namaBantuan: string;
  namaBantuanSelesai: string;
  namaBantuanLain: string;
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
  const namaBantuanSelesai = `Bantuan Selesai E2E ${run}`;
  const namaBantuanLain = `Bantuan Warga Lain E2E ${run}`;
  const programIds: number[] = [];

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
    programIds.push(program.insertId);
    await pool.execute(
      "INSERT INTO bantuan_peserta (village_id, program_id, resident_id) VALUES (?, ?, ?)",
      [warga.desaId, program.insertId, residentId],
    );

    // Program kedua untuk warga yang sama, tetapi masanya sudah berakhir.
    const [programSelesai] = await pool.execute<ResultSetHeader>(
      `INSERT INTO bantuan_program
         (village_id, name, slug, sasaran, description, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, '2020-01-01', '2020-12-31')`,
      [
        warga.desaId,
        namaBantuanSelesai,
        `bantuan-selesai-e2e-${run}`,
        1,
        "Program bantuan yang sudah selesai.",
      ],
    );
    programIds.push(programSelesai.insertId);
    await pool.execute(
      "INSERT INTO bantuan_peserta (village_id, program_id, resident_id) VALUES (?, ?, ?)",
      [warga.desaId, programSelesai.insertId, residentId],
    );

    // Program ketiga tanpa peserta: tidak boleh tampil untuk warga mana pun.
    const [programLain] = await pool.execute<ResultSetHeader>(
      `INSERT INTO bantuan_program (village_id, name, slug, sasaran, description)
       VALUES (?, ?, ?, ?, ?)`,
      [warga.desaId, namaBantuanLain, `bantuan-lain-e2e-${run}`, 1, "Program tanpa penerima."],
    );
    programIds.push(programLain.insertId);

    return {
      namaBantuan,
      namaBantuanSelesai,
      namaBantuanLain,
      wargaNik: warga.warga.nik,
      async hapus() {
        for (const id of programIds) {
          await pool.execute("DELETE FROM bantuan_peserta WHERE program_id = ?", [id]);
          await pool.execute("DELETE FROM bantuan_program WHERE id = ?", [id]);
        }
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
