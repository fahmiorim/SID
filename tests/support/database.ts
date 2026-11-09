import { createHash } from "node:crypto";
import { createPool, type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

/**
 * Helper database untuk E2E.
 *
 * Dipakai hanya untuk hal yang tidak dapat diperoleh lewat UI: mencari ID baris
 * hasil sebuah alur, dan membersihkan data uji setelah test selesai.
 */
async function denganPool<T>(fn: (pool: Pool) => Promise<T>): Promise<T> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk helper database E2E.");

  const pool = createPool(dsn);
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

/** Ambil ID penduduk berdasarkan NIK (hasil pembuatan lewat UI). */
export async function idPendudukDariNik(nik: string): Promise<number | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM residents WHERE national_id = ? LIMIT 1",
      [nik],
    );
    return rows[0] ? Number(rows[0].id) : null;
  });
}

/** Hapus anjungan uji berdasarkan nama (cleanup bila langkah UI gagal). */
export async function hapusAnjunganDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM anjungan WHERE nama = ?", [nama]);
  });
}

/** Hapus penduduk uji (tanpa NIK, mis. bayi) berdasarkan nama. */
export async function hapusPendudukDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM residents WHERE name = ?", [
      nama,
    ]);
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM resident_mutations WHERE resident_id = ?", [id]);
      await pool.execute("DELETE FROM residents WHERE id = ?", [id]);
    }
  });
}

/** Hapus penduduk uji beserta riwayat mutasinya. */

export async function hapusPendudukDariNik(nik: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM residents WHERE national_id = ?",
      [nik],
    );
    const ids = rows.map((row) => Number(row.id));
    for (const id of ids) {
      await pool.execute("DELETE FROM resident_mutations WHERE resident_id = ?", [id]);
      await pool.execute("DELETE FROM residents WHERE id = ?", [id]);
    }
  });
}

/** Hapus kategori kelompok uji berdasarkan nama. */
export async function hapusKategoriKelompokDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM kelompok_master WHERE name = ?", [nama]);
  });
}

/** Hapus proyek pembangunan uji berdasarkan judul. */
export async function hapusProyekDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM pembangunan_proyek WHERE judul = ?",
      [judul],
    );
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM pembangunan_dokumentasi WHERE proyek_id = ?", [id]);
      await pool.execute("DELETE FROM pembangunan_proyek WHERE id = ?", [id]);
    }
  });
}

/** Hapus wilayah uji berdasarkan nama dusun. */
export async function hapusWilayahDariDusun(dusun: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM regions WHERE dusun = ?", [dusun]);
  });
}

/** Hapus kelompok/lembaga uji berdasarkan nama. */
export async function hapusKelompokDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM kelompok WHERE name = ?", [
      nama,
    ]);
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM kelompok_anggota WHERE kelompok_id = ?", [id]);
      await pool.execute("DELETE FROM kelompok WHERE id = ?", [id]);
    }
  });
}

/** Hapus kartu keluarga uji berdasarkan nomor KK. */
export async function hapusKeluargaDariNomor(nomor: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM families WHERE number = ?", [nomor]);
  });
}

/** Hapus rumah tangga uji berdasarkan nomor BDT. */
export async function hapusRtmDariBdt(bdt: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM rtm WHERE bdt = ?", [bdt]);
  });
}

/** Hapus seluruh data keuangan uji pada satu tahun anggaran. */
export async function hapusKeuanganTahun(tahun: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM keuangan WHERE tahun = ?", [tahun]);
    await pool.execute("DELETE FROM keuangan_triwulan WHERE tahun = ?", [tahun]);
  });
}

/** Hapus baris SiLPA uji berdasarkan keterangan. */
export async function hapusSisaLebihDariKeterangan(keterangan: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM sisa_lebih WHERE keterangan = ?", [keterangan]);
  });
}

/** Hapus definisi suplemen uji berdasarkan nama. */
export async function hapusSuplemenDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM suplemen WHERE nama = ?", [nama]);
  });
}

/** Hapus riwayat mutasi berdasarkan nomor surat (untuk data uji kelahiran). */
export async function hapusMutasiDariSurat(referenceNo: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM resident_mutations WHERE reference_no = ?", [referenceNo]);
  });
}

/** Hapus kategori analisis uji berdasarkan nama. */
export async function hapusKategoriAnalisisDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM analisis_kategori WHERE nama = ?", [nama]);
  });
}

/** Hapus indikator analisis uji berdasarkan kode. */
export async function hapusIndikatorAnalisisDariKode(kode: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM analisis_indikator WHERE kode = ?", [kode]);
  });
}

/** Hapus survei uji (beserta soal & jawaban) berdasarkan judul. */
export async function hapusSurveyDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM survey WHERE judul = ?", [judul]);
  });
}

/** Buat program bantuan uji untuk desa milik admin, lalu kembalikan ID-nya. */
export async function buatProgramBantuanDariNama(nama: string): Promise<number> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO bantuan_program (village_id, name, slug, sasaran, asal_dana, start_date, end_date)
       VALUES (?, ?, ?, 1, 4, '2024-01-01', '2024-12-31')`,
      [villageId, nama, `e2e-${Date.now()}`],
    );
    return hasil.insertId;
  });
}

/** Hapus program bantuan uji beserta pesertanya berdasarkan nama. */
export async function hapusProgramBantuanDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM bantuan_program WHERE name = ?",
      [nama],
    );
    for (const row of rows) {
      await pool.execute("DELETE FROM bantuan_peserta WHERE program_id = ?", [Number(row.id)]);
      await pool.execute("DELETE FROM bantuan_program WHERE id = ?", [Number(row.id)]);
    }
  });
}

/** Buat survei publik aktif uji, kembalikan ID-nya. */
export async function buatSurveyPublikDariJudul(judul: string): Promise<number> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO survey (village_id, judul, deskripsi, sasaran, mulai, selesai, aktif)
       VALUES (?, ?, 'Survei uji E2E', 'Warga', '2020-01-01', '2099-12-31', 1)`,
      [villageId, judul],
    );
    return hasil.insertId;
  });
}

/** Nonaktifkan survei uji berdasarkan judul (uji tampilan publik). */
export async function nonaktifkanSurveyDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("UPDATE survey SET aktif = 0 WHERE judul = ?", [judul]);
  });
}

/** Hapus berita uji berdasarkan judul. */
export async function hapusBeritaDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM berita WHERE judul = ?", [judul]);
  });
}

/** Hapus album galeri uji berdasarkan nama. */
export async function hapusAlbumGaleriDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM galeri_album WHERE nama = ?", [
      nama,
    ]);
    for (const row of rows) {
      await pool.execute("DELETE FROM galeri_foto WHERE album_id = ?", [Number(row.id)]);
      await pool.execute("DELETE FROM galeri_album WHERE id = ?", [Number(row.id)]);
    }
  });
}

/** Buat pemilihan uji beserta dua kandidat, kembalikan data untuk assertion. */
export async function buatPemilihanDenganKandidat(
  jenis: string,
): Promise<{ id: number; kandidat: [string, string] }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO pemilihan (village_id, tahun, jenis, tanggal, keterangan) VALUES (?, 2099, ?, '2099-06-01', 'Uji E2E')",
      [villageId, jenis],
    );
    const kandidat: [string, string] = [`Kandidat A ${jenis}`, `Kandidat B ${jenis}`];
    await pool.execute(
      "INSERT INTO pemilihan_kandidat (village_id, pemilihan_id, nomor_urut, nama, jumlah_suara) VALUES (?, ?, 1, ?, 7), (?, ?, 2, ?, 3)",
      [villageId, hasil.insertId, kandidat[0], villageId, hasil.insertId, kandidat[1]],
    );
    return { id: hasil.insertId, kandidat };
  });
}

/** Hapus pemilihan uji (kandidat ikut terhapus) berdasarkan jenis. */
export async function hapusPemilihanDariJenis(jenis: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM pemilihan WHERE jenis = ?", [
      jenis,
    ]);
    for (const row of rows) {
      await pool.execute("DELETE FROM pemilihan_kandidat WHERE pemilihan_id = ?", [Number(row.id)]);
      await pool.execute("DELETE FROM pemilihan WHERE id = ?", [Number(row.id)]);
    }
  });
}

/** Ambil nomor tiket pengaduan terbaru berdasarkan judul. */
export async function ambilPengaduanTerbaruDariJudul(
  judul: string,
): Promise<{ id: number; nomorTiket: string }> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, nomor_tiket FROM pengaduan WHERE judul = ? ORDER BY id DESC LIMIT 1",
      [judul],
    );
    if (!rows[0]) throw new Error("Pengaduan uji tidak ditemukan.");
    return { id: Number(rows[0].id), nomorTiket: String(rows[0].nomor_tiket) };
  });
}

/** Status pengaduan uji berdasarkan judul (untuk menunggu commit E2E). */
export async function ambilStatusPengaduanDariJudul(judul: string): Promise<string | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT status FROM pengaduan WHERE judul = ? ORDER BY id DESC LIMIT 1",
      [judul],
    );
    return rows[0] ? String(rows[0].status) : null;
  });
}

/** Hapus pengaduan uji berdasarkan judul. */
export async function hapusPengaduanDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM pengaduan WHERE judul = ?", [judul]);
  });
}

/** Hapus barang inventaris uji berdasarkan nama. */
export async function hapusInventarisDariNama(namaBarang: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM inventaris WHERE nama_barang = ?", [namaBarang]);
  });
}

/** Siapkan satu plugin aktif untuk desa admin; kembalikan status awal. */
export async function siapkanPluginAktifUji(
  slug: string,
): Promise<{ slug: string; aktif: number }[]> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT slug, aktif FROM plugin_registry WHERE village_id = ?",
      [villageId],
    );
    await pool.execute("DELETE FROM plugin_registry WHERE village_id = ?", [villageId]);
    await pool.execute("INSERT INTO plugin_registry (village_id, slug, aktif) VALUES (?, ?, 1)", [
      villageId,
      slug,
    ]);
    return rows.map((row) => ({ slug: String(row.slug), aktif: Number(row.aktif) }));
  });
}

/** Pulihkan status plugin seperti sebelum uji. */
export async function pulihkanPluginUji(rows: { slug: string; aktif: number }[]): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    await pool.execute("DELETE FROM plugin_registry WHERE village_id = ?", [villageId]);
    for (const row of rows) {
      await pool.execute("INSERT INTO plugin_registry (village_id, slug, aktif) VALUES (?, ?, ?)", [
        villageId,
        row.slug,
        row.aktif,
      ]);
    }
  });
}

/** Hapus lapak uji berdasarkan nama. */
export async function hapusLapakDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM lapak WHERE nama = ?", [nama]);
  });
}

/** Hapus pengajuan izin uji berdasarkan alasan. */
export async function hapusIzinDariAlasan(alasan: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM kehadiran_izin WHERE alasan = ?", [alasan]);
  });
}

/**
 * Buat penduduk uji tanpa akun untuk alur registrasi mandiri.
 *
 * Registrasi menolak NIK yang sudah punya akun, jadi penduduk fixture harus
 * baru dan dibersihkan lagi setelah test.
 */
export async function buatPendudukUntukRegistrasi(nik: string, nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    await pool.execute(
      `INSERT INTO residents (village_id, national_id, name, gender, address)
       VALUES (?, ?, ?, 'male', 'Jl. Registrasi E2E')`,
      [villageId, nik, nama],
    );
  });
}

/** Hapus akun, permohonan, dan penduduk uji hasil registrasi mandiri. */
export async function hapusRegistrasiWargaDariNik(nik: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM users WHERE username = ?", [nik]);
    await pool.execute("DELETE FROM registrasi_warga WHERE nik = ?", [nik]);
    await pool.execute("DELETE FROM residents WHERE national_id = ?", [nik]);
  });
}

/**
 * Buat surat terbit uji dengan token verifikasi publik.
 *
 * Halaman `/layanan-mandiri/verifikasi-surat` mencari surat lewat hash
 * SHA-256 token, jadi helper ini menyimpan token mentah sekaligus hash-nya.
 */
export async function buatSuratUjiDenganToken(input: {
  token: string;
  nomor: string;
  jenis: string;
  tanggal: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [types] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM letter_types WHERE village_id = ? ORDER BY id LIMIT 1",
      [villageId],
    );
    const typeId = Number(types[0]?.id);
    if (!typeId) throw new Error("Jenis surat desa E2E tidak ditemukan.");

    const hash = createHash("sha256").update(input.token).digest("hex");
    await pool.execute(
      `INSERT INTO letters
         (village_id, type_id, type_name, number, status, letter_date, year, purpose,
          verification_token, verification_token_hash, issued_at)
       VALUES (?, ?, ?, ?, 'issued', ?, ?, 'Uji E2E verifikasi surat', ?, ?, NOW())`,
      [
        villageId,
        typeId,
        input.jenis,
        input.nomor,
        input.tanggal,
        Number(input.tanggal.slice(0, 4)),
        input.token,
        hash,
      ],
    );
  });
}

/**
 * Buat surat uji yang sudah lolos operator + sekdes dan menunggu keputusan kades.
 *
 * `createdByUsername` menentukan pembuat konsep, dipakai untuk menguji larangan
 * memverifikasi surat sendiri pada tahap persetujuan.
 */
export async function buatSuratMenungguKadesUji(input: {
  tujuan: string;
  createdByUsername: string;
}): Promise<{ id: number; typeName: string }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [pembuat] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [input.createdByUsername],
    );
    const pembuatId = pembuat[0] ? String(pembuat[0].id) : null;
    if (!pembuatId) throw new Error(`Pengguna ${input.createdByUsername} tidak ditemukan.`);

    const [types] = await pool.query<RowDataPacket[]>(
      "SELECT id, name FROM letter_types WHERE village_id = ? ORDER BY id LIMIT 1",
      [villageId],
    );
    const typeId = Number(types[0]?.id);
    const typeName = String(types[0]?.name ?? "");
    if (!typeId) throw new Error("Jenis surat desa E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letters
         (village_id, type_id, type_name, status, letter_date, year, purpose,
          verifikasi_operator, verifikasi_sekdes, created_by)
       VALUES (?, ?, ?, 'verifikasi', '2026-11-10', 2026, ?, 1, 1, ?)`,
      [villageId, typeId, typeName, input.tujuan, pembuatId],
    );
    return { id: hasil.insertId, typeName };
  });
}

/** Status verifikasi surat uji (untuk memastikan penolakan tidak mengubah data). */
export async function ambilStatusVerifikasiSurat(id: number): Promise<{
  status: string;
  verifikasiOperator: boolean | null;
  verifikasiSekdes: boolean | null;
  verifikasiKades: boolean | null;
} | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT status, verifikasi_operator, verifikasi_sekdes, verifikasi_kades FROM letters WHERE id = ? LIMIT 1",
      [id],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      status: String(row.status),
      verifikasiOperator:
        row.verifikasi_operator === null ? null : Boolean(row.verifikasi_operator),
      verifikasiSekdes: row.verifikasi_sekdes === null ? null : Boolean(row.verifikasi_sekdes),
      verifikasiKades: row.verifikasi_kades === null ? null : Boolean(row.verifikasi_kades),
    };
  });
}

/** Hapus surat uji berdasarkan ID. */
export async function hapusSuratDariId(id: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM letters WHERE id = ?", [id]);
  });
}

/** Hapus surat uji berdasarkan token verifikasi. */
export async function hapusSuratDariToken(token: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM letters WHERE verification_token = ?", [token]);
  });
}

/**
 * Buat RTM uji beserta kepala rumah tangga untuk impor DTKS.
 *
 * Impor DTKS mencocokkan `rtm.number` dan menyalin seluruh penduduk RTM
 * sebagai anggota, jadi fixture harus punya kepala dengan `rtm_level` 1.
 */
export async function buatRtmDenganKepalaUji(input: {
  nomor: string;
  namaKepala: string;
}): Promise<number> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO rtm (village_id, number, address) VALUES (?, ?, 'Alamat RTM E2E')",
      [villageId, input.nomor],
    );
    await pool.execute(
      "INSERT INTO residents (village_id, name, gender, rtm_id, rtm_level) VALUES (?, ?, 'male', ?, 1)",
      [villageId, input.namaKepala, hasil.insertId],
    );
    return hasil.insertId;
  });
}

/** Hapus RTM uji beserta formulir DTKS dan anggotanya. */
export async function hapusRtmUji(id: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM dtks WHERE rtm_id = ?", [id]);
    await pool.execute("DELETE FROM residents WHERE rtm_id = ?", [id]);
    await pool.execute("DELETE FROM rtm WHERE id = ?", [id]);
  });
}

/** Buat baris pendapat uji langsung di DB untuk alur moderasi admin. */
export async function buatPendapatUji(pengguna: string, pilihan: number): Promise<number> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO pendapat (village_id, pengguna, pilihan, session_key) VALUES (?, ?, ?, ?)",
      [
        villageId,
        pengguna,
        pilihan,
        `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      ],
    );
    return hasil.insertId;
  });
}

/**
 * Hapus pendapat anonim dari satu alamat IP.
 *
 * Kunci sesi jajak pendapat = hash(`anon:<ip>`), jadi submit pertama dari IP
 * yang sama akan tertolak bila baris smoke lama masih tersisa. Fixture ini
 * memakai IP loopback yang sama dengan browser E2E.
 */
export async function hapusPendapatAnonimDariIp(ip: string): Promise<void> {
  const sessionKey = createHash("sha256").update(`anon:${ip}`).digest("hex").slice(0, 64);
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM pendapat WHERE resident_id IS NULL AND session_key = ?", [
      sessionKey,
    ]);
  });
}

/** Hitung pendapat uji dari nama pengirim (membersihkan juga memakai nama ini). */
export async function hitungPendapatDariPengguna(pengguna: string): Promise<number> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM pendapat WHERE pengguna = ?",
      [pengguna],
    );
    return Number(rows[0]?.total ?? 0);
  });
}

/** Hapus pendapat uji berdasarkan nama pengirim. */
export async function hapusPendapatDariPengguna(pengguna: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM pendapat WHERE pengguna = ?", [pengguna]);
  });
}

/** Buat indikator IDM uji langsung di DB (fixture tampilan publik). */
export async function buatIdmUji(input: {
  tahun: number;
  kode: string;
  nama: string;
  skor: number;
}): Promise<number> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO idm_indikator (village_id, tahun, kode, nama, skor) VALUES (?, ?, ?, ?, ?)",
      [villageId, input.tahun, input.kode, input.nama, input.skor],
    );
    return hasil.insertId;
  });
}

/** Simpan capaian SDGs uji langsung di DB (fixture tampilan publik). */
export async function buatSdgsUji(input: {
  tahun: number;
  goal: number;
  skor: number;
  keterangan: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    await pool.execute(
      `INSERT INTO idm_sdgs (village_id, tahun, goal, skor, keterangan)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE skor = VALUES(skor), keterangan = VALUES(keterangan)`,
      [villageId, input.tahun, input.goal, input.skor, input.keterangan],
    );
  });
}

/** Hapus seluruh indikator IDM serta capaian SDGs uji pada satu tahun. */
export async function hapusIdmTahun(tahun: number): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    await pool.execute("DELETE FROM idm_indikator WHERE village_id = ? AND tahun = ?", [
      villageId,
      tahun,
    ]);
    await pool.execute("DELETE FROM idm_sdgs WHERE village_id = ? AND tahun = ?", [
      villageId,
      tahun,
    ]);
  });
}

/** Hapus dokumen laporan uji berdasarkan judul (fallback bila UI gagal). */
export async function hapusLaporanDokumenDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM keuangan_laporan WHERE judul = ?", [judul]);
  });
}
