import { randomInt, randomUUID } from "node:crypto";
import { createPool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

/**
 * Fixture E2E untuk Anjungan (`OS-MOD-001`).
 *
 * Membuat data yang tidak boleh bergantung pada seed bersama:
 * - perangkat kiosk dengan izin surat tanpa akun,
 * - perangkat tanpa izin untuk menguji gerbang akses,
 * - perangkat milik desa lain untuk menguji isolasi tenant,
 * - penduduk dengan tanggal lahir yang diketahui,
 * - satu jenis surat tanpa syarat agar alur kiosk dapat diselesaikan.
 */
export interface AnjunganFixture {
  desaLain: {
    nama: string;
    uuid: string;
  };
  kiosk: {
    namaAnjungan: string;
    namaPenduduk: string;
    nik: string;
    tanggalLahir: string;
    namaJenis: string;
    jenisId: number;
    uuid: string;
    uuidTanpaIzin: string;
    namaTanpaIzin: string;
    ipAddressPortPrinter: string;
  };
  jumlahPermohonan(): Promise<number>;
  hapus(): Promise<void>;
}

interface AdminRow extends RowDataPacket {
  village_id: number;
}

function nikUji(): string {
  return `3201${Array.from({ length: 12 }, () => randomInt(0, 10)).join("")}`;
}

export async function buatFixtureAnjungan(): Promise<AnjunganFixture> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk fixture Anjungan E2E.");

  const pool = createPool(dsn);
  const run = randomUUID().slice(0, 8);
  const desaLainNama = `Anjungan Desa Lain ${run}`;
  const desaLainUuid = randomUUID();
  const namaAnjungan = `Anjungan Kiosk ${run}`;
  const namaTanpaIzin = `Anjungan Tanpa Izin ${run}`;
  const namaPenduduk = `Warga Kiosk ${run}`;
  const nik = nikUji();
  const tanggalLahir = "1990-05-17";
  const namaJenis = `Surat Kiosk ${run}`;
  const uuid = randomUUID();
  const uuidTanpaIzin = randomUUID();
  const ipAddressPortPrinter = "127.0.0.1:9100";

  let desaLainId: number | null = null;
  let pendudukId: number | null = null;
  let jenisId: number | null = null;
  let desaLainDeviceId: number | null = null;
  let deviceId: number | null = null;
  let deviceTanpaIzinId: number | null = null;
  let sudahDihapus = false;

  async function hapus(): Promise<void> {
    if (sudahDihapus) return;
    sudahDihapus = true;

    try {
      if (jenisId !== null) {
        await pool.execute("DELETE FROM permohonan_surat WHERE letter_type_id = ?", [jenisId]);
      }
      if (desaLainDeviceId !== null) {
        await pool.execute("DELETE FROM anjungan WHERE id = ?", [desaLainDeviceId]);
      }
      if (deviceId !== null) {
        await pool.execute("DELETE FROM anjungan WHERE id = ?", [deviceId]);
      }
      if (deviceTanpaIzinId !== null) {
        await pool.execute("DELETE FROM anjungan WHERE id = ?", [deviceTanpaIzinId]);
      }
      if (jenisId !== null) {
        await pool.execute("DELETE FROM letter_types WHERE id = ?", [jenisId]);
      }
      if (pendudukId !== null) {
        await pool.execute("DELETE FROM residents WHERE id = ?", [pendudukId]);
      }
      if (desaLainId !== null) {
        await pool.execute("DELETE FROM villages WHERE id = ?", [desaLainId]);
      }
    } finally {
      await pool.end();
    }
  }

  try {
    const [admins] = await pool.execute<AdminRow[]>(
      "SELECT village_id FROM users WHERE username = ? LIMIT 1",
      [process.env.E2E_ADMIN_USERNAME ?? "admin"],
    );
    const villageId = admins[0]?.village_id;
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [desaLain] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code, slug) VALUES (?, ?, ?)",
      [`Desa Lain ${run}`, `AL${run}`, `desa-lain-${run}`],
    );
    desaLainId = desaLain.insertId;

    const [penduduk] = await pool.execute<ResultSetHeader>(
      `INSERT INTO residents (village_id, national_id, name, gender, birth_date, address)
       VALUES (?, ?, ?, 'male', ?, 'Jl. Kiosk E2E')`,
      [villageId, nik, namaPenduduk, tanggalLahir],
    );
    pendudukId = penduduk.insertId;

    const [jenis] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letter_types
         (village_id, code, name, template_body, form_isian, syarat_surat, requires_resident, is_active)
       VALUES (?, ?, ?, ?, '[]', '[]', 1, 1)`,
      [villageId, `K${run.slice(0, 7)}`, namaJenis, `<p>Surat kiosk ${namaPenduduk}.</p>`],
    );
    const jenisRowId = jenis.insertId;
    jenisId = jenisRowId;

    async function buatPerangkat(input: {
      villageId: number;
      nama: string;
      uuid: string;
      izinSurat: number;
    }): Promise<number> {
      const [hasil] = await pool.execute<ResultSetHeader>(
        `INSERT INTO anjungan
           (village_id, nama, uuid, aktif, urutan, keyboard, orientasi_layar,
            permohonan_surat_tanpa_akun, ip_address_port_printer, status)
         VALUES (?, ?, ?, 1, 0, 0, 1, ?, ?, 'aktif')`,
        [input.villageId, input.nama, input.uuid, input.izinSurat, ipAddressPortPrinter],
      );
      return hasil.insertId;
    }

    desaLainDeviceId = await buatPerangkat({
      villageId: desaLainId,
      nama: desaLainNama,
      uuid: desaLainUuid,
      izinSurat: 0,
    });
    deviceId = await buatPerangkat({
      villageId,
      nama: namaAnjungan,
      uuid,
      izinSurat: 1,
    });
    deviceTanpaIzinId = await buatPerangkat({
      villageId,
      nama: namaTanpaIzin,
      uuid: uuidTanpaIzin,
      izinSurat: 0,
    });

    return {
      desaLain: { nama: desaLainNama, uuid: desaLainUuid },
      kiosk: {
        namaAnjungan,
        namaPenduduk,
        nik,
        tanggalLahir,
        namaJenis,
        jenisId: jenisRowId,
        uuid,
        uuidTanpaIzin,
        namaTanpaIzin,
        ipAddressPortPrinter,
      },
      async jumlahPermohonan() {
        if (jenisId === null) return 0;
        const [rows] = await pool.execute<RowDataPacket[]>(
          "SELECT COUNT(*) AS total FROM permohonan_surat WHERE letter_type_id = ?",
          [jenisId],
        );
        return Number(rows[0]?.total ?? 0);
      },
      hapus,
    };
  } catch (error) {
    await hapus();
    throw error;
  }
}
