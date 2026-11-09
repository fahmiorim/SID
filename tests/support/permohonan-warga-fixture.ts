import { randomInt, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { createPool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

interface AdminRoleRow extends RowDataPacket {
  role_id: number | null;
  village_id: number | null;
}

interface LetterRow extends RowDataPacket {
  id: number;
  number: string | null;
  status: string;
  verification_token: string | null;
}

interface IsianRow extends RowDataPacket {
  isian_form: string | null;
}

export interface PermohonanWargaFixture {
  namaJenis: string;
  namaJenisVariasi: string;
  syaratNama: string;
  jenisId: number;
  jenisVariasiId: number;
  desaId: number;
  operatorUsername: string;
  warga: { nama: string; nik: string };
  wargaLain: { nik: string };
  ambilSuratTerbit(): Promise<{
    id: number;
    number: string | null;
    verificationToken: string | null;
  } | null>;
  /** Status verifikasi surat terbaru untuk jenis uji (draft/verifikasi/issued/cancelled). */
  ambilSuratTerbaru(): Promise<{
    id: number;
    number: string | null;
    status: string;
    verifikasiOperator: boolean | null;
    verifikasiSekdes: boolean | null;
    verifikasiKades: boolean | null;
    createdBy: string | null;
  } | null>;
  /** Nilai isian dinamis permohonan terakhir pada jenis variasi. */
  ambilIsianPermohonan(): Promise<Record<string, string> | null>;
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
  const namaJenisVariasi = `Surat Variasi E2E ${run}`;
  const syaratNama = `Berkas Uji E2E ${run}`;
  // Semua tipe isian dinamis (OS-WGA-004), sengaja tanpa berkas syarat.
  const formIsianVariasi = [
    { kode: "nama_kegiatan", label: "Nama Kegiatan", tipe: "text", required: true },
    {
      kode: "alamat_kegiatan",
      label: "Alamat Kegiatan",
      tipe: "textarea",
      required: false,
      placeholder: "Alamat lengkap kegiatan",
    },
    { kode: "jumlah_peserta", label: "Jumlah Peserta", tipe: "number", required: true },
    { kode: "tanggal_kegiatan", label: "Tanggal Kegiatan", tipe: "date", required: true },
    {
      kode: "kategori_kegiatan",
      label: "Kategori Kegiatan",
      tipe: "select",
      required: true,
      opsi: ["Sosial", "Ekonomi"],
    },
    {
      kode: "butuh_transport",
      label: "Butuh Transport",
      tipe: "checkbox",
      required: false,
      placeholder: "Perlu transport",
    },
  ];
  const warga = { nama: `Warga Uji ${run}`, nik: nikUji() };
  const wargaLain = { nik: nikUji() };
  const userIds = [randomUUID(), randomUUID(), randomUUID()];
  const operatorUsername = `e2e-${run}`;
  const adminUsername = process.env.E2E_ADMIN_USERNAME ?? "admin";
  let desaId: number | null = null;
  let syaratId: number | null = null;
  let jenisId: number | null = null;
  let jenisVariasiId: number | null = null;
  let sudahDihapus = false;

  async function hapus(): Promise<void> {
    if (sudahDihapus) return;
    sudahDihapus = true;

    try {
      if (desaId !== null) {
        await pool.execute("DELETE FROM users WHERE id IN (?, ?, ?)", userIds);
        for (const id of [jenisId, jenisVariasiId]) {
          if (id === null) continue;
          await pool.execute("DELETE FROM letters WHERE type_id = ?", [id]);
          await pool.execute("DELETE FROM permohonan_surat WHERE letter_type_id = ?", [id]);
          await pool.execute("DELETE FROM letter_types WHERE id = ?", [id]);
        }
        if (syaratId !== null) {
          await pool.execute("DELETE FROM letter_requirements WHERE id = ?", [syaratId]);
        }
        await pool.execute("DELETE FROM residents WHERE national_id IN (?, ?)", [
          warga.nik,
          wargaLain.nik,
        ]);
      }
    } finally {
      await pool.end();
    }
  }

  async function ambilSuratTerbit(): Promise<{
    id: number;
    number: string | null;
    verificationToken: string | null;
  } | null> {
    if (desaId === null || jenisId === null) return null;
    const [rows] = await pool.execute<LetterRow[]>(
      `SELECT id, number, status, verification_token
       FROM letters
       WHERE village_id = ? AND type_id = ? AND status = 'issued'
       ORDER BY id DESC
       LIMIT 1`,
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
  async function ambilSuratTerbaru(): Promise<{
    id: number;
    number: string | null;
    status: string;
    verifikasiOperator: boolean | null;
    verifikasiSekdes: boolean | null;
    verifikasiKades: boolean | null;
    createdBy: string | null;
  } | null> {
    if (desaId === null || jenisId === null) return null;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, number, status, verifikasi_operator, verifikasi_sekdes, verifikasi_kades, created_by
       FROM letters
       WHERE village_id = ? AND type_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [desaId, jenisId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: Number(row.id),
      number: (row.number as string | null) ?? null,
      status: String(row.status),
      verifikasiOperator:
        row.verifikasi_operator === null ? null : Boolean(row.verifikasi_operator),
      verifikasiSekdes: row.verifikasi_sekdes === null ? null : Boolean(row.verifikasi_sekdes),
      verifikasiKades: row.verifikasi_kades === null ? null : Boolean(row.verifikasi_kades),
      createdBy: (row.created_by as string | null) ?? null,
    };
  }

  async function ambilIsianPermohonan(): Promise<Record<string, string> | null> {
    if (desaId === null || jenisVariasiId === null) return null;
    const [rows] = await pool.execute<IsianRow[]>(
      `SELECT isian_form FROM permohonan_surat
       WHERE village_id = ? AND letter_type_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [desaId, jenisVariasiId],
    );
    const raw = rows[0]?.isian_form;
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, string>;
  }

  try {
    const [adminRows] = await pool.execute<AdminRoleRow[]>(
      "SELECT role_id, village_id FROM users WHERE username = ? LIMIT 1",
      [adminUsername],
    );
    const adminRow = adminRows[0];
    if (!adminRow?.role_id || !adminRow.village_id) {
      throw new Error("Akun admin E2E tidak memiliki desa/role.");
    }
    const [operatorRoles] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM roles WHERE slug = 'operator' AND village_id = ? LIMIT 1",
      [adminRow.village_id],
    );
    const operatorRoleId = (operatorRoles[0]?.id as number | undefined) ?? adminRow.role_id;

    // Pakai desa utama: modul/RBAC dan akun sekdes/kades yang dipakai test
    // semuanya milik desa ini, sedangkan data fixture dibedakan lewat NIK dan
    // nama jenis surat yang acak.
    desaId = adminRow.village_id;

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

    const [variasiResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letter_types
        (village_id, code, name, template_body, form_isian, syarat_surat, requires_resident, is_active)
       VALUES (?, ?, ?, ?, ?, '[]', 1, 1)`,
      [
        desaId,
        `E2V${run.slice(0, 5)}`,
        namaJenisVariasi,
        `<p>Surat variasi isian untuk ${warga.nama}.</p>`,
        JSON.stringify(formIsianVariasi),
      ],
    );
    jenisVariasiId = variasiResult.insertId;

    return {
      namaJenis,
      namaJenisVariasi,
      syaratNama,
      jenisId,
      jenisVariasiId,
      operatorUsername,
      desaId,
      warga,
      wargaLain,
      ambilSuratTerbit,
      ambilSuratTerbaru,
      ambilIsianPermohonan,
      hapus,
    };
  } catch (error) {
    await hapus();
    throw error;
  }
}
