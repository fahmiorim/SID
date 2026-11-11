import { createHash, randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { hashPassword } from "better-auth/crypto";
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

/** Desa milik akun admin E2E. */
async function desaAdmin(pool: Pool): Promise<number> {
  const [users] = await pool.query<RowDataPacket[]>(
    "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
  );
  const villageId = Number(users[0]?.village_id);
  if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");
  return villageId;
}

/** Penduduk hidup ber-NIK 16 digit untuk setup E2E kontak/suplemen. */
export async function pendudukBernikUji(
  jumlah = 2,
): Promise<{ id: number; nik: string; nama: string }[]> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, national_id, name FROM residents
        WHERE village_id = ? AND life_status = 'alive'
          AND national_id REGEXP '^[0-9]{16}$'
        ORDER BY id LIMIT 10`,
      [villageId],
    );
    return rows.slice(0, jumlah).map((row) => ({
      id: Number(row.id),
      nik: String(row.national_id),
      nama: String(row.name),
    }));
  });
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

/** Angka yang harus tampil pada ringkasan buku penduduk B1–B5. */
export interface RingkasanBukuPenduduk {
  total: number;
  lakiLaki: number;
  perempuan: number;
  permanent: number;
  temporary: number;
  withKtp: number;
  withKk: number;
  tanpaKk: number;
  lahir: number;
  mati: number;
  pindahKeluar: number;
  datang: number;
  perubahan: number;
}

/** Hitung ringkasan dari tabel sumber, bukan dari teks halaman. */
export async function ringkasanBukuPenduduk(): Promise<RingkasanBukuPenduduk> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [penduduk] = await pool.query<RowDataPacket[]>(
      `SELECT gender, residence_status, family_id, national_id
       FROM residents WHERE village_id = ? AND life_status = 'alive'`,
      [villageId],
    );
    const [mutasi] = await pool.query<RowDataPacket[]>(
      "SELECT type, COUNT(*) AS jumlah FROM resident_mutations WHERE village_id = ? GROUP BY type",
      [villageId],
    );

    const hasil: RingkasanBukuPenduduk = {
      total: penduduk.length,
      lakiLaki: 0,
      perempuan: 0,
      permanent: 0,
      temporary: 0,
      withKtp: 0,
      withKk: 0,
      tanpaKk: 0,
      lahir: 0,
      mati: 0,
      pindahKeluar: 0,
      datang: 0,
      perubahan: 0,
    };

    for (const row of penduduk) {
      if (row.gender === "male") hasil.lakiLaki++;
      else hasil.perempuan++;
      if (row.residence_status === "temporary") hasil.temporary++;
      else hasil.permanent++;
      if (row.national_id) hasil.withKtp++;
      if (row.family_id) hasil.withKk++;
      else hasil.tanpaKk++;
    }

    const kunci = {
      birth: "lahir",
      death: "mati",
      move_out: "pindahKeluar",
      move_in: "datang",
      change: "perubahan",
    } as const;
    for (const row of mutasi) {
      const nama = kunci[row.type as keyof typeof kunci];
      if (nama) hasil[nama] = Number(row.jumlah);
    }

    return hasil;
  });
}

/** Hapus item ringkasan yang dibuat tombol sinkronisasi buku penduduk. */
export async function hapusItemSinkronisasiBukuPenduduk(): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_item WHERE keterangan = ?", [
      "Ringkasan otomatis data penduduk",
    ]);
  });
}

/** Buat persil tanah kas uji beserta satu mutasi. */
export async function buatTanahKasUji(input: {
  nomorPersil: string;
  asal: string;
  luas: string;
  lokasi: string;
  status: string;
  nilai: string;
  jenisMutasi: string;
  uraianMutasi: string;
}): Promise<number> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO bumindes_tanah_kas
       (village_id, nomor_persil, asal, luas, lokasi, status, nilai)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        villageId,
        input.nomorPersil,
        input.asal,
        input.luas,
        input.lokasi,
        input.status,
        input.nilai,
      ],
    );
    await pool.execute(
      `INSERT INTO bumindes_tanah_kas_mutasi
       (village_id, tanah_kas_id, tanggal, jenis, uraian, luas_perubahan, nilai_perubahan)
       VALUES (?, ?, '2026-02-03', ?, ?, '2.50', '1500000.00')`,
      [villageId, hasil.insertId, input.jenisMutasi, input.uraianMutasi],
    );
    return hasil.insertId;
  });
}

/** Hapus persil tanah kas uji (mutasi ikut terhapus lewat foreign key). */
export async function hapusTanahKasDariNomorPersil(nomorPersil: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM bumindes_tanah_kas WHERE nomor_persil = ?",
      [nomorPersil],
    );
    for (const row of rows) {
      await pool.execute("DELETE FROM bumindes_tanah_kas_mutasi WHERE tanah_kas_id = ?", [
        Number(row.id),
      ]);
      await pool.execute("DELETE FROM bumindes_tanah_kas WHERE id = ?", [Number(row.id)]);
    }
  });
}

/** Buat kegiatan pada Buku Pembangunan (bukan proyek publik). */
export async function buatBukuPembangunanUji(input: {
  namaKegiatan: string;
  tahun: number;
  lokasi: string;
  sumberDana: string;
  biaya: string;
  status: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    await pool.execute(
      `INSERT INTO bumindes_pembangunan
       (village_id, tahun, nama_kegiatan, lokasi, sumber_dana, biaya, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        villageId,
        input.tahun,
        input.namaKegiatan,
        input.lokasi,
        input.sumberDana,
        input.biaya,
        input.status,
      ],
    );
  });
}

/** Hapus kegiatan Buku Pembangunan uji. */
export async function hapusBukuPembangunanDariNama(namaKegiatan: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_pembangunan WHERE nama_kegiatan = ?", [namaKegiatan]);
  });
}

/** Buat kader pembangunan uji. */
export async function buatKaderPembangunanUji(input: {
  nama: string;
  jabatan: string;
  bidang: string;
  alamat: string;
  noHp: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    await pool.execute(
      `INSERT INTO bumindes_kader (village_id, nama, jabatan, bidang, alamat, no_hp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [villageId, input.nama, input.jabatan, input.bidang, input.alamat, input.noHp],
    );
  });
}

/** Hapus kader pembangunan uji. */
export async function hapusKaderPembangunanDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_kader WHERE nama = ?", [nama]);
  });
}

/** Buat peraturan/keputusan desa uji. */
export async function buatPeraturanUji(input: {
  nomor: string;
  jenis: string;
  tentang: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    await pool.execute(
      `INSERT INTO bumindes_peraturan
       (village_id, jenis, nomor, tahun, tentang, tanggal_ditetapkan, tanggal_diundangkan)
       VALUES (?, ?, ?, 2026, ?, '2026-03-04', '2026-03-05')`,
      [villageId, input.jenis, input.nomor, input.tentang],
    );
  });
}

/** Hapus peraturan/keputusan desa uji. */
export async function hapusPeraturanDariNomor(nomor: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_peraturan WHERE nomor = ?", [nomor]);
  });
}

/** Buat aparat pemerintah desa uji. */
export async function buatAparatUji(input: {
  nama: string;
  nip: string;
  jabatan: string;
  pendidikan: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    await pool.execute(
      `INSERT INTO bumindes_aparat
       (village_id, nama, nip, jabatan, pendidikan, tanggal_pengangkatan)
       VALUES (?, ?, ?, ?, ?, '2026-04-06')`,
      [villageId, input.nama, input.nip, input.jabatan, input.pendidikan],
    );
  });
}

/** Buat satu baris agenda/ekspedisi uji. */
export async function buatAgendaBukuUji(input: {
  jenis: "masuk" | "keluar";
  nomorSurat: string;
  asalTujuan: string;
  perihal: string;
}): Promise<void> {
  await denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    await pool.execute(
      `INSERT INTO bumindes_agenda
       (village_id, jenis, tanggal, nomor_surat, asal_tujuan, perihal)
       VALUES (?, ?, '2026-05-07', ?, ?, ?)`,
      [villageId, input.jenis, input.nomorSurat, input.asalTujuan, input.perihal],
    );
  });
}

/** Hapus agenda/ekspedisi uji berdasarkan nomor surat. */
export async function hapusAgendaBukuDariNomor(nomorSurat: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_agenda WHERE nomor_surat = ?", [nomorSurat]);
  });
}

/** Hapus aparat pemerintah desa uji. */
export async function hapusAparatDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_aparat WHERE nama = ?", [nama]);
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

/**
 * Buat satu pesan kotak masuk email uji pada desa admin.
 *
 * Webhook email hanya menerima payload bila `EMAIL_WEBHOOK_TOKEN` diatur, jadi
 * E2E `OS-OPS-005` menyiapkan barisnya langsung untuk membuktikan alur baca,
 * tandai dibaca, dan filter kanal dari UI.
 */
export async function buatPesanMailboxUji(input: {
  subjek: string;
  alamat: string;
  isi: string;
}): Promise<number> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO mailbox_pesan (village_id, arah, alamat, subjek, isi, dibaca) VALUES (?, 'masuk', ?, ?, ?, 0)",
      [villageId, input.alamat, input.subjek, input.isi],
    );
    return hasil.insertId;
  });
}

/** Status baca satu pesan kotak masuk uji. */
export async function bacaStatusPesanMailbox(id: number): Promise<boolean | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT dibaca FROM mailbox_pesan WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] ? Boolean(rows[0].dibaca) : null;
  });
}

/** Hapus pesan kotak masuk uji berdasarkan subjek. */
export async function hapusPesanMailboxDariSubjek(subjek: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM mailbox_pesan WHERE subjek = ?", [subjek]);
  });
}

/** Perangkat desa pertama untuk setup E2E kehadiran. */
export async function perangkatUntukKehadiranUji(): Promise<{ id: number; nama: string }> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, nama FROM perangkat_desa WHERE village_id = ? ORDER BY id LIMIT 1",
      [villageId],
    );
    const row = rows[0];
    if (!row) throw new Error("Perangkat desa E2E tidak ditemukan.");
    return { id: Number(row.id), nama: String(row.nama) };
  });
}

/** Hapus catatan kehadiran uji berdasarkan perangkat dan tanggal. */
export async function hapusKehadiranDariPerangkatTanggal(
  perangkatId: number,
  tanggal: string,
): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM kehadiran_perangkat WHERE perangkat_id = ? AND tanggal = ?", [
      perangkatId,
      tanggal,
    ]);
  });
}

/** Hapus perangkat desa uji berdasarkan nama (pembersihan alur bagan SOTK). */
export async function hapusPerangkatDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM perangkat_desa WHERE nama = ?", [nama]);
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

/** Logo desa admin saat ini; dipakai untuk memulihkan identitas setelah unggah uji. */
export async function bacaLogoDesaUji(): Promise<{ villageId: number; logo: string | null }> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [rows] = await pool.query<RowDataPacket[]>("SELECT logo FROM villages WHERE id = ?", [
      villageId,
    ]);
    return { villageId, logo: rows[0]?.logo ? String(rows[0].logo) : null };
  });
}

/** Pulihkan kolom logo desa setelah unggahan uji. */
export async function pulihkanLogoDesaUji(villageId: number, logo: string | null): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("UPDATE villages SET logo = ? WHERE id = ?", [logo, villageId]);
  });
}

/** Jalur absolut berkas media uji; menolak jalur yang keluar dari storage/media. */
function jalurBerkasMediaUji(relatif: string): string {
  const akar = path.resolve(process.cwd(), "storage", "media");
  const absolut = path.resolve(akar, relatif);
  if (!absolut.startsWith(akar + path.sep)) throw new Error("Jalur media uji di luar storage.");
  return absolut;
}

/** Tulis berkas media uji (mis. kategori privat) tanpa lewat UI. */
export async function tulisBerkasMediaUji(relatif: string, isi: Buffer): Promise<void> {
  const absolut = jalurBerkasMediaUji(relatif);
  await mkdir(path.dirname(absolut), { recursive: true });
  await writeFile(absolut, isi);
}

/** Hapus berkas media uji dari disk. */
export async function hapusBerkasMediaUji(relatif: string): Promise<void> {
  try {
    await unlink(jalurBerkasMediaUji(relatif));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

/** Hapus definisi suplemen uji berdasarkan nama. */
export async function hapusSuplemenDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM suplemen WHERE nama = ?", [nama]);
  });
}

/** Hapus rentang umur uji berdasarkan nama. */
export async function hapusRentangUmurDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM rentang_umur WHERE nama = ?", [nama]);
  });
}

/** Hapus kontak uji beserta keanggotaan grupnya. */
export async function hapusKontakDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM kontak WHERE nama = ?", [
      nama,
    ]);
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM anggota_grup_kontak WHERE kontak_id = ?", [id]);
      await pool.execute("DELETE FROM kontak WHERE id = ?", [id]);
    }
  });
}

/** Hapus grup kontak uji beserta anggotanya. */
export async function hapusGrupKontakDariNama(namaGrup: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM kontak_grup WHERE nama_grup = ?",
      [namaGrup],
    );
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM anggota_grup_kontak WHERE grup_id = ?", [id]);
      await pool.execute("DELETE FROM kontak_grup WHERE id = ?", [id]);
    }
  });
}

/**
 * Buat suplemen desa sendiri beserta satu data terhimpun.
 *
 * Dipakai halaman publik `OS-WEB-012`: ringkasan hanya boleh menampilkan
 * agregat (jumlah data dan nama kolom), bukan nilai isian warga.
 */
export async function buatSuplemenPublikUji(input: {
  nama: string;
  sasaran?: number;
  keterangan?: string;
  isian?: Record<string, string>;
}): Promise<{ id: number; slug: string }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const slug = `e2e-suplemen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const [suplemen] = await pool.execute<ResultSetHeader>(
      "INSERT INTO suplemen (village_id, nama, slug, sasaran, keterangan) VALUES (?, ?, ?, ?, ?)",
      [villageId, input.nama, slug, input.sasaran ?? 2, input.keterangan ?? null],
    );
    await pool.execute(
      "INSERT INTO suplemen_terdata (village_id, id_suplemen, data_form_isian) VALUES (?, ?, ?)",
      [villageId, suplemen.insertId, JSON.stringify(input.isian ?? {})],
    );
    return { id: suplemen.insertId, slug };
  });
}

/** Hapus suplemen publik uji beserta data terhimpunnya. */
export async function hapusSuplemenPublikUji(id: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM suplemen_terdata WHERE id_suplemen = ?", [id]);
    await pool.execute("DELETE FROM suplemen WHERE id = ?", [id]);
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

/**
 * Buat survei aktif lengkap (soal, responden, jawaban) di desa admin.
 *
 * Dipakai halaman publik `OS-WEB-013`: rekap yang dipublikasikan hanya boleh
 * berupa agregat, jadi nama/NIK responden dan isi jawaban teks disimpan di
 * sini untuk dibuktikan tidak pernah tampil di halaman publik.
 */
export async function buatSurveiAnalisisPublikUji(input: {
  judul: string;
  soal: { pertanyaan: string; tipe: "choice" | "number" | "text"; pilihan?: string[] }[];
  responden?: { nama: string; nik: string; jawaban: string[] }[];
}): Promise<{ id: number; soalIds: number[] }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [survei] = await pool.execute<ResultSetHeader>(
      `INSERT INTO survey (village_id, judul, deskripsi, sasaran, mulai, selesai, aktif)
       VALUES (?, ?, 'Survei uji rekap publik E2E', 'Warga usia produktif', '2020-01-01', '2099-12-31', 1)`,
      [villageId, input.judul],
    );

    const soalIds: number[] = [];
    for (const [urutan, soal] of input.soal.entries()) {
      const [baris] = await pool.execute<ResultSetHeader>(
        "INSERT INTO survey_soal (survey_id, pertanyaan, tipe, pilihan, urutan) VALUES (?, ?, ?, ?, ?)",
        [
          survei.insertId,
          soal.pertanyaan,
          soal.tipe,
          soal.pilihan ? JSON.stringify(soal.pilihan) : null,
          urutan,
        ],
      );
      soalIds.push(baris.insertId);
    }

    for (const responden of input.responden ?? []) {
      const [baris] = await pool.execute<ResultSetHeader>(
        "INSERT INTO survey_responden (survey_id, nama, nik) VALUES (?, ?, ?)",
        [survei.insertId, responden.nama, responden.nik],
      );
      for (const [index, jawaban] of responden.jawaban.entries()) {
        const soalId = soalIds[index];
        if (!soalId) continue;
        await pool.execute(
          "INSERT INTO survey_jawaban (responden_id, soal_id, jawaban) VALUES (?, ?, ?)",
          [baris.insertId, soalId, jawaban],
        );
      }
    }

    return { id: survei.insertId, soalIds };
  });
}

/**
 * Buat survei aktif pada desa fixture tersendiri.
 *
 * Dipakai untuk membuktikan isolasi tenant halaman publik `OS-WEB-013`:
 * survei desa lain tidak boleh muncul di daftar maupun terbuka lewat `/isi`.
 */
export async function buatSurveiDesaLainUji(
  judul: string,
): Promise<{ id: number; villageId: number }> {
  return denganPool(async (pool) => {
    const kode = `SL${Date.now().toString().slice(-8)}`;
    const [desa] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code, slug) VALUES (?, ?, ?)",
      [`Desa Survei Lain ${kode}`, kode, `desa-survei-${kode.toLowerCase()}`],
    );
    const [survei] = await pool.execute<ResultSetHeader>(
      `INSERT INTO survey (village_id, judul, sasaran, mulai, selesai, aktif)
       VALUES (?, ?, 'Warga desa lain', '2020-01-01', '2099-12-31', 1)`,
      [desa.insertId, judul],
    );
    await pool.execute(
      "INSERT INTO survey_soal (survey_id, pertanyaan, tipe, pilihan, urutan) VALUES (?, ?, 'choice', ?, 0)",
      [survei.insertId, "Pertanyaan rahasia desa lain", JSON.stringify(["Ya", "Tidak"])],
    );
    return { id: survei.insertId, villageId: desa.insertId };
  });
}

/** Hapus survei desa lain beserta desa fixture-nya. */
export async function hapusSurveiDesaLainUji(id: number, villageId: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM survey WHERE id = ?", [id]);
    await pool.execute("DELETE FROM villages WHERE id = ?", [villageId]);
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

/** Status simpanan berita uji; dipakai untuk memastikan publikasi sudah tersimpan. */
export async function bacaBeritaDariJudul(
  judul: string,
): Promise<{ status: string; terbitPada: Date | null } | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT status, terbit_pada FROM berita WHERE judul = ? LIMIT 1",
      [judul],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      status: String(row.status),
      terbitPada: row.terbit_pada ? new Date(row.terbit_pada) : null,
    };
  });
}

/** Hapus dokumen publik uji berdasarkan nama. */
export async function hapusDokumenDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM dokumen_publik WHERE nama = ?", [nama]);
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

/**
 * Buat barang inventaris uji beserta kategorinya pada desa admin.
 *
 * Dipakai halaman publik `OS-WEB-011`: filter dan ekspor CSV hanya boleh
 * menampilkan barang milik desa ini.
 */
export async function buatInventarisPublikUji(input: {
  nama: string;
  kategori: string;
  lokasi?: string;
  tahun?: number;
  jumlah?: string;
  nilai?: string;
}): Promise<{ id: number; kategoriId: number }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [kategori] = await pool.execute<ResultSetHeader>(
      "INSERT INTO inventaris_kategori (village_id, kode, nama, golongan) VALUES (?, ?, ?, 'peralatan_mesin')",
      [villageId, `E2E${Date.now().toString().slice(-8)}`, input.kategori],
    );
    const [barang] = await pool.execute<ResultSetHeader>(
      `INSERT INTO inventaris
         (village_id, kategori_id, nama_barang, jumlah, satuan, kondisi, lokasi,
          tahun_pembelian, nilai_akhir)
       VALUES (?, ?, ?, ?, 'unit', 'baik', ?, ?, ?)`,
      [
        villageId,
        kategori.insertId,
        input.nama,
        input.jumlah ?? "2",
        input.lokasi ?? "Gudang E2E",
        input.tahun ?? 2026,
        input.nilai ?? "1500000",
      ],
    );
    return { id: barang.insertId, kategoriId: kategori.insertId };
  });
}

/**
 * Buat barang inventaris pada desa fixture tersendiri.
 *
 * Dipakai untuk membuktikan isolasi tenant halaman publik `OS-WEB-011`.
 */
export async function buatInventarisDesaLainUji(input: {
  nama: string;
  kategori: string;
}): Promise<{ id: number; kategoriId: number; villageId: number }> {
  return denganPool(async (pool) => {
    const kode = `IL${Date.now().toString().slice(-8)}`;
    const [desa] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code, slug) VALUES (?, ?, ?)",
      [`Desa Inventaris Lain ${kode}`, kode, `desa-inventaris-${kode.toLowerCase()}`],
    );
    const [kategori] = await pool.execute<ResultSetHeader>(
      "INSERT INTO inventaris_kategori (village_id, kode, nama, golongan) VALUES (?, ?, ?, 'peralatan_mesin')",
      [desa.insertId, `E2E${Date.now().toString().slice(-8)}`, input.kategori],
    );
    const [barang] = await pool.execute<ResultSetHeader>(
      "INSERT INTO inventaris (village_id, kategori_id, nama_barang, jumlah, satuan, kondisi) VALUES (?, ?, ?, '1', 'unit', 'baik')",
      [desa.insertId, kategori.insertId, input.nama],
    );
    return { id: barang.insertId, kategoriId: kategori.insertId, villageId: desa.insertId };
  });
}

/** Hapus barang inventaris uji, kategorinya, dan desa fixture bila ada. */
export async function hapusInventarisUji(input: {
  id: number;
  kategoriId: number;
  villageId?: number;
}): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM inventaris WHERE id = ?", [input.id]);
    await pool.execute("DELETE FROM inventaris_kategori WHERE id = ?", [input.kategoriId]);
    if (input.villageId) {
      await pool.execute("DELETE FROM villages WHERE id = ?", [input.villageId]);
    }
  });
}

/**
 * Siapkan profil desa dan perangkat untuk halaman publik `OS-WEB-003`.
 *
 * Profil sebelumnya dipulihkan pada pembersihan agar data seed tidak berubah.
 * Jabatan yang sudah ada (mis. "Kepala Desa") dipakai ulang, bukan diduplikasi.
 */
export async function buatProfilDanPerangkatPublikUji(input: {
  visi: string;
  misi: string[];
  perangkat: { nama: string; jabatan: "kepala" | "sekretaris" | "staf" }[];
}): Promise<{
  perangkatIds: number[];
  jabatanIds: number[];
  profilAwal: {
    visi: string | null;
    misi: string | null;
    sejarah: string | null;
    sambutan: string | null;
    koordinat: string | null;
  } | null;
}> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [profilRows] = await pool.query<RowDataPacket[]>(
      "SELECT visi, misi, sejarah, sambutan, koordinat FROM profil_desa WHERE village_id = ? LIMIT 1",
      [villageId],
    );
    const profilAwal = profilRows[0]
      ? {
          visi: profilRows[0].visi ?? null,
          misi: profilRows[0].misi ?? null,
          sejarah: profilRows[0].sejarah ?? null,
          sambutan: profilRows[0].sambutan ?? null,
          koordinat: profilRows[0].koordinat ?? null,
        }
      : null;

    if (profilAwal) {
      await pool.execute("UPDATE profil_desa SET visi = ?, misi = ? WHERE village_id = ?", [
        input.visi,
        input.misi.join("\n"),
        villageId,
      ]);
    } else {
      await pool.execute("INSERT INTO profil_desa (village_id, visi, misi) VALUES (?, ?, ?)", [
        villageId,
        input.visi,
        input.misi.join("\n"),
      ]);
    }

    const namaJabatan = {
      kepala: "Kepala Desa",
      sekretaris: "Sekretaris Desa",
      staf: "Staf Pemerintahan",
    } as const;
    const jabatanIds: number[] = [];
    const perangkatIds: number[] = [];
    const idJabatan = new Map<string, number>();

    for (const [urutan, orang] of input.perangkat.entries()) {
      const nama = namaJabatan[orang.jabatan];
      let jabatanId = idJabatan.get(nama);
      if (jabatanId === undefined) {
        const [ada] = await pool.query<RowDataPacket[]>(
          "SELECT id FROM jabatan_perangkat WHERE village_id = ? AND nama = ? LIMIT 1",
          [villageId, nama],
        );
        if (ada[0]) {
          jabatanId = Number(ada[0].id);
        } else {
          const [baru] = await pool.execute<ResultSetHeader>(
            "INSERT INTO jabatan_perangkat (village_id, nama, slug, urut) VALUES (?, ?, ?, ?)",
            [villageId, nama, `e2e-${orang.jabatan}-${Date.now()}-${urutan}`, urutan],
          );
          jabatanId = baru.insertId;
          jabatanIds.push(baru.insertId);
        }
        idJabatan.set(nama, jabatanId);
      }

      const [perangkat] = await pool.execute<ResultSetHeader>(
        "INSERT INTO perangkat_desa (village_id, jabatan_id, nama, status, urut) VALUES (?, ?, ?, 'aktif', ?)",
        [villageId, jabatanId, orang.nama, urutan],
      );
      perangkatIds.push(perangkat.insertId);
    }

    return { perangkatIds, jabatanIds, profilAwal };
  });
}

/** Pulihkan profil desa dan hapus perangkat/jabatan fixture. */
export async function hapusProfilDanPerangkatUji(input: {
  perangkatIds: number[];
  jabatanIds: number[];
  profilAwal: {
    visi: string | null;
    misi: string | null;
    sejarah: string | null;
    sambutan: string | null;
    koordinat: string | null;
  } | null;
}): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);

    for (const id of input.perangkatIds) {
      await pool.execute("DELETE FROM perangkat_desa WHERE id = ?", [id]);
    }
    for (const id of input.jabatanIds) {
      await pool.execute("DELETE FROM jabatan_perangkat WHERE id = ?", [id]);
    }

    if (input.profilAwal) {
      await pool.execute(
        `UPDATE profil_desa
            SET visi = ?, misi = ?, sejarah = ?, sambutan = ?, koordinat = ?
          WHERE village_id = ?`,
        [
          input.profilAwal.visi,
          input.profilAwal.misi,
          input.profilAwal.sejarah,
          input.profilAwal.sambutan,
          input.profilAwal.koordinat,
          villageId,
        ],
      );
    } else {
      await pool.execute("DELETE FROM profil_desa WHERE village_id = ?", [villageId]);
    }
  });
}

/**
 * Buat lapak UMKM uji beserta produknya di desa admin.
 *
 * Dipakai halaman publik `OS-WEB-014`: katalog, produk, dan peta produk.
 */
export async function buatLapakPublikUji(input: {
  nama: string;
  kategori?: string;
  produk: { nama: string; harga: string; stok?: number; latitude?: string; longitude?: string }[];
}): Promise<{ id: number; produkIds: number[] }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [lapak] = await pool.execute<ResultSetHeader>(
      `INSERT INTO lapak (village_id, nama, pemilik, kategori, alamat)
       VALUES (?, ?, 'Warga E2E', ?, 'Jl. Lapak E2E')`,
      [villageId, input.nama, input.kategori ?? null],
    );

    const produkIds: number[] = [];
    for (const produk of input.produk) {
      const [baris] = await pool.execute<ResultSetHeader>(
        `INSERT INTO lapak_produk
           (village_id, lapak_id, nama, harga, stok, aktif, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          villageId,
          lapak.insertId,
          produk.nama,
          produk.harga,
          produk.stok ?? 1,
          produk.latitude ?? null,
          produk.longitude ?? null,
        ],
      );
      produkIds.push(baris.insertId);
    }

    return { id: lapak.insertId, produkIds };
  });
}

/** Hapus lapak uji beserta produknya. */
export async function hapusLapakPublikUji(input: {
  id: number;
  produkIds: number[];
}): Promise<void> {
  await denganPool(async (pool) => {
    for (const id of input.produkIds) {
      await pool.execute("DELETE FROM lapak_produk WHERE id = ?", [id]);
    }
    await pool.execute("DELETE FROM lapak WHERE id = ?", [input.id]);
  });
}

/** Hapus barang inventaris uji berdasarkan nama. */
/**
 * Buat satu penduduk hidup beserta dusun unik pada desa admin.
 *
 * Dipakai E2E statistik publik `OS-WEB-006` untuk membuktikan sebaran dusun
 * dan unduhan CSV hanya memuat penduduk desa pemilik host.
 */
export async function buatPendudukStatistikUji(input: {
  nama: string;
  nik: string;
  dusun: string;
  rw?: string;
  rt?: string;
  gender?: "male" | "female";
  birthDate?: string;
  /** Pakai wilayah yang sudah dibuat agar beberapa penduduk berbagi dusun. */
  regionId?: number;
}): Promise<{ id: number; regionId: number }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    let regionId = input.regionId;
    if (!regionId) {
      const [wilayah] = await pool.execute<ResultSetHeader>(
        "INSERT INTO regions (village_id, dusun, rw, rt) VALUES (?, ?, ?, ?)",
        [villageId, input.dusun, input.rw ?? null, input.rt ?? null],
      );
      regionId = wilayah.insertId;
    }
    const [penduduk] = await pool.execute<ResultSetHeader>(
      `INSERT INTO residents (village_id, national_id, name, gender, birth_date, region_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [villageId, input.nik, input.nama, input.gender ?? "male", input.birthDate ?? null, regionId],
    );
    return { id: penduduk.insertId, regionId };
  });
}

/**
 * Buat penduduk + dusun pada desa fixture tersendiri.
 *
 * Dipakai untuk membuktikan isolasi tenant statistik publik: angka desa lain
 * tidak boleh muncul di halaman maupun CSV desa admin.
 */
export async function buatPendudukDesaLainStatistikUji(input: {
  nama: string;
  nik: string;
  dusun: string;
}): Promise<{ id: number; regionId: number; villageId: number }> {
  return denganPool(async (pool) => {
    const kode = `ST${Date.now().toString().slice(-8)}`;
    const [desa] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code, slug) VALUES (?, ?, ?)",
      [`Desa Statistik Lain ${kode}`, kode, `desa-statistik-${kode.toLowerCase()}`],
    );
    const [wilayah] = await pool.execute<ResultSetHeader>(
      "INSERT INTO regions (village_id, dusun) VALUES (?, ?)",
      [desa.insertId, input.dusun],
    );
    const [penduduk] = await pool.execute<ResultSetHeader>(
      `INSERT INTO residents (village_id, national_id, name, gender, region_id)
       VALUES (?, ?, ?, 'female', ?)`,
      [desa.insertId, input.nik, input.nama, wilayah.insertId],
    );
    return { id: penduduk.insertId, regionId: wilayah.insertId, villageId: desa.insertId };
  });
}

/** Hapus penduduk statistik uji, dusunnya, dan desa fixture bila ada. */
export async function hapusPendudukStatistikUji(input: {
  id: number;
  regionId: number;
  villageId?: number;
}): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM resident_mutations WHERE resident_id = ?", [input.id]);
    await pool.execute("DELETE FROM residents WHERE id = ?", [input.id]);
    await pool.execute("DELETE FROM regions WHERE id = ?", [input.regionId]);
    if (input.villageId) {
      await pool.execute("DELETE FROM villages WHERE id = ?", [input.villageId]);
    }
  });
}

/** Satu set layer peta uji pada desa admin (OS-WEB-007). */
export interface LayerPetaUji {
  polygonId: number;
  areaId: number;
  garisId: number;
  pointId: number;
}

/**
 * Buat layer polygon, area, garis, dan titik pada desa admin.
 *
 * Dipakai E2E peta publik `OS-WEB-007` untuk membuktikan kontrol layer
 * menampilkan/menyembunyikan setiap kelompok geometri dan peta cetak memuat
 * legendanya.
 */
export async function buatLayerPetaUji(input: {
  polygon: string;
  area: string;
  garis: string;
  titik: string;
}): Promise<LayerPetaUji> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [polygon] = await pool.execute<ResultSetHeader>(
      "INSERT INTO polygon (village_id, nama, color, tipe, enabled) VALUES (?, ?, '#2563eb', 0, 1)",
      [villageId, input.polygon],
    );
    const areaPath = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          [110.4, -7.2],
          [110.5, -7.2],
          [110.5, -7.3],
          [110.4, -7.3],
          [110.4, -7.2],
        ],
      ],
    });
    const [area] = await pool.execute<ResultSetHeader>(
      "INSERT INTO area (village_id, nama, path, ref_polygon, enabled) VALUES (?, ?, ?, ?, 1)",
      [villageId, input.area, areaPath, polygon.insertId],
    );
    const garisPath = JSON.stringify({
      type: "LineString",
      coordinates: [
        [110.41, -7.21],
        [110.49, -7.29],
      ],
    });
    const [garis] = await pool.execute<ResultSetHeader>(
      "INSERT INTO garis (village_id, nama, path, enabled) VALUES (?, ?, ?, 1)",
      [villageId, input.garis, garisPath],
    );
    const titikPath = JSON.stringify({ type: "Point", coordinates: [110.45, -7.25] });
    const [point] = await pool.execute<ResultSetHeader>(
      "INSERT INTO point (village_id, nama, path, tipe, enabled) VALUES (?, ?, ?, 1, 1)",
      [villageId, input.titik, titikPath],
    );

    return {
      polygonId: polygon.insertId,
      areaId: area.insertId,
      garisId: garis.insertId,
      pointId: point.insertId,
    };
  });
}

/** Hapus satu set layer peta uji beserta polygon induknya. */
export async function hapusLayerPetaUji(layer: LayerPetaUji): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM area WHERE id = ?", [layer.areaId]);
    await pool.execute("DELETE FROM garis WHERE id = ?", [layer.garisId]);
    await pool.execute("DELETE FROM point WHERE id = ?", [layer.pointId]);
    await pool.execute("DELETE FROM polygon WHERE id = ?", [layer.polygonId]);
  });
}

export async function hapusInventarisDariNama(namaBarang: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM inventaris WHERE nama_barang = ?", [namaBarang]);
  });
}

/** Hapus kategori inventaris uji setelah barang yang memakainya dibersihkan. */
export async function hapusKategoriInventarisDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM inventaris_kategori WHERE nama = ?", [nama]);
  });
}

/** Hapus item buku administrasi uji berdasarkan uraiannya. */
export async function hapusItemBukuDariUraian(uraian: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM bumindes_item WHERE uraian = ?", [uraian]);
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
}): Promise<{ id: number; typeId: number }> {
  return denganPool(async (pool) => {
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
    const [hasil] = await pool.execute<ResultSetHeader>(
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
    return { id: hasil.insertId, typeId };
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

/** Baca override pengaturan lampiran uji; `null` berarti masih default domain. */
export async function bacaPengaturanLampiranUji(kategori: string): Promise<{
  mimeAllowlist: string[] | null;
  maxFiles: number | null;
  maxSizeBytes: number | null;
} | null> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mime_allowlist, max_files, max_size_bytes FROM media_settings
        WHERE village_id = ? AND kategori = ? LIMIT 1`,
      [villageId, kategori],
    );
    const row = rows[0];
    if (!row) return null;

    const mime = row.mime_allowlist;
    const mimeAllowlist = Array.isArray(mime)
      ? (mime as string[])
      : typeof mime === "string"
        ? (JSON.parse(mime) as string[])
        : null;

    return {
      mimeAllowlist,
      maxFiles: row.max_files === null ? null : Number(row.max_files),
      maxSizeBytes: row.max_size_bytes === null ? null : Number(row.max_size_bytes),
    };
  });
}

/** Pulihkan override pengaturan lampiran ke keadaan sebelum uji. */
export async function pulihkanPengaturanLampiranUji(
  kategori: string,
  awal: {
    mimeAllowlist: string[] | null;
    maxFiles: number | null;
    maxSizeBytes: number | null;
  } | null,
): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    await pool.execute("DELETE FROM media_settings WHERE village_id = ? AND kategori = ?", [
      villageId,
      kategori,
    ]);
    if (!awal) return;

    await pool.execute(
      `INSERT INTO media_settings
         (village_id, kategori, mime_allowlist, max_files, max_size_bytes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        villageId,
        kategori,
        awal.mimeAllowlist ? JSON.stringify(awal.mimeAllowlist) : null,
        awal.maxFiles,
        awal.maxSizeBytes,
      ],
    );
  });
}

/**
 * Buat surat uji dengan status tertentu untuk menguji aksi baris per status.
 *
 * `issued` mengisi `issued_at`; `draft`/`verifikasi` tidak, supaya menu aksi
 * yang tampil sama seperti surat asli berstatus itu.
 */
export async function buatSuratUjiDenganStatus(input: {
  nomor: string;
  status: "draft" | "verifikasi" | "issued";
  jenis: string;
  pemohon?: string;
}): Promise<{ id: number; nomor: string }> {
  return denganPool(async (pool) => {
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

    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO letters
         (village_id, type_id, type_name, number, status, letter_date, year, purpose,
          pemohon, issued_at)
       VALUES (?, ?, ?, ?, ?, '2026-11-10', 2026, 'Uji E2E unduh PDF per status', ?, ?)`,
      [
        villageId,
        typeId,
        input.jenis,
        input.nomor,
        input.status,
        input.pemohon ?? null,
        input.status === "issued" ? new Date() : null,
      ],
    );

    return { id: hasil.insertId, nomor: input.nomor };
  });
}

/** Identitas desa milik akun admin E2E, untuk assertion yang tidak bergantung seed. */
export async function bacaIdentitasDesaUji(): Promise<{ nama: string; email: string | null }> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT v.name, v.email
         FROM villages v
         JOIN users u ON u.village_id = v.id
        WHERE u.username = 'admin'
        LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new Error("Desa admin E2E tidak ditemukan.");

    return {
      nama: String(row.name),
      email: typeof row.email === "string" ? row.email : null,
    };
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

/** Buat penduduk dengan tanggal lahir cukup umur agar muncul pada DPT. */
export async function buatPendudukDptUji(nik: string, nama: string): Promise<void> {
  await denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    await pool.execute(
      `INSERT INTO residents (village_id, national_id, name, gender, birth_date, address)
       VALUES (?, ?, ?, 'male', '1990-01-01', 'Jl. DPT E2E')`,
      [villageId, nik, nama],
    );
  });
}

/** Hapus pemilihan DPT uji berdasarkan judul. */
export async function hapusPemilihanDptDariJudul(judul: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM elections WHERE judul = ?", [judul]);
  });
}

/** Hapus posyandu uji berdasarkan nama. */
export async function hapusPosyanduDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM posyandu WHERE nama = ?", [nama]);
  });
}

/** Hapus KIA uji beserta pemantauan ibu hamil dan anak yang terkait. */
export async function hapusKesehatanDariNoKia(noKia: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM kia WHERE no_kia = ?", [
      noKia,
    ]);
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM bulanan_anak WHERE kia_id = ?", [id]);
      await pool.execute("DELETE FROM ibu_hamil WHERE kia_id = ?", [id]);
      await pool.execute("DELETE FROM kia WHERE id = ?", [id]);
    }
  });
}

/** Hapus buku tamu uji berdasarkan nama. */
export async function hapusBukuTamuDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM buku_tamu WHERE nama = ?", [nama]);
  });
}

/**
 * Buat pelanggan beserta dokumennya pada desa lain.
 *
 * Dipakai untuk membuktikan isolasi tenant pada unduhan dokumen kerja sama:
 * admin desa sendiri tidak boleh membaca baris milik desa lain meski ID-nya
 * ditebak. Desa fixture dibuat khusus agar tidak mengganggu data seed.
 */
export async function buatPelangganDesaLainUji(
  nama: string,
): Promise<{ id: number; villageId: number }> {
  return denganPool(async (pool) => {
    const kode = `DL${Date.now().toString().slice(-8)}`;
    const [desa] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code, slug) VALUES (?, ?, ?)",
      [nama, kode, `desa-lain-${kode.toLowerCase()}`],
    );
    const [pelanggan] = await pool.execute<ResultSetHeader>(
      `INSERT INTO pelanggan (village_id, nama, dokumen_kerjasama, dokumen_nama, dokumen_mime)
       VALUES (?, ?, 'desa-lain/dokumen.pdf', 'dokumen.pdf', 'application/pdf')`,
      [desa.insertId, nama],
    );
    return { id: pelanggan.insertId, villageId: desa.insertId };
  });
}

/** Hapus pelanggan desa lain beserta desa fixture-nya. */
export async function hapusPelangganDesaLainUji(id: number, villageId: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM pelanggan WHERE id = ?", [id]);
    await pool.execute("DELETE FROM villages WHERE id = ?", [villageId]);
  });
}

/**
 * Baca disposisi terakhir sebuah surat masuk uji.
 *
 * Dipakai E2E `OS-SUR-009`: toast sukses membuktikan aksi UI berjalan, dan
 * pembacaan ini membuktikan instruksinya benar-benar tersimpan.
 */
export async function bacaDisposisiTerakhirSuratMasuk(nomor: string): Promise<{
  instruction: string;
  toRole: string | null;
  dueDate: string | null;
} | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT d.instruction, d.to_role, d.due_date
         FROM incoming_letter_dispositions d
         JOIN incoming_letters s ON s.id = d.incoming_letter_id
        WHERE s.letter_number = ?
        ORDER BY d.id DESC LIMIT 1`,
      [nomor],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      instruction: String(row.instruction),
      toRole: row.to_role === null ? null : String(row.to_role),
      dueDate: row.due_date === null ? null : String(row.due_date),
    };
  });
}

/** Baca ekspedisi terakhir sebuah surat keluar uji (OS-SUR-010). */
export async function bacaEkspedisiTerakhirSuratKeluar(nomor: string): Promise<{
  sentDate: string;
  recipient: string | null;
  deliveryMethod: string | null;
} | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT e.sent_date, e.recipient, e.delivery_method
         FROM outgoing_letter_shipments e
         JOIN outgoing_letters s ON s.id = e.outgoing_letter_id
        WHERE s.letter_number = ?
        ORDER BY e.id DESC LIMIT 1`,
      [nomor],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      sentDate: String(row.sent_date),
      recipient: row.recipient === null ? null : String(row.recipient),
      deliveryMethod: row.delivery_method === null ? null : String(row.delivery_method),
    };
  });
}

/** Hapus surat masuk uji beserta disposisi dan log agendanya. */
export async function hapusSuratMasukDariNomor(nomor: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM incoming_letters WHERE letter_number = ?",
      [nomor],
    );
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM incoming_letter_dispositions WHERE incoming_letter_id = ?", [
        id,
      ]);
      await pool.execute(
        "DELETE FROM unified_shipments WHERE source_module = 'surat_masuk' AND source_id = ?",
        [id],
      );
      await pool.execute("DELETE FROM letter_agenda_logs WHERE type = 'masuk' AND letter_id = ?", [
        id,
      ]);
      await pool.execute("DELETE FROM incoming_letters WHERE id = ?", [id]);
    }
  });
}

/** Hapus surat keluar uji beserta ekspedisi dan log agendanya. */
export async function hapusSuratKeluarDariNomor(nomor: string): Promise<void> {
  await denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM outgoing_letters WHERE letter_number = ?",
      [nomor],
    );
    for (const row of rows) {
      const id = Number(row.id);
      await pool.execute("DELETE FROM outgoing_letter_shipments WHERE outgoing_letter_id = ?", [
        id,
      ]);
      await pool.execute(
        "DELETE FROM unified_shipments WHERE source_module = 'surat_keluar' AND source_id = ?",
        [id],
      );
      await pool.execute("DELETE FROM letter_agenda_logs WHERE type = 'keluar' AND letter_id = ?", [
        id,
      ]);
      await pool.execute("DELETE FROM outgoing_letters WHERE id = ?", [id]);
    }
  });
}

/**
 * Buat survei aktif dengan satu pertanyaan pilihan ganda.
 *
 * Dipakai E2E `OS-ANA-005`: token formulir harus dibuat server (dibaca dari UI
 * admin), sedangkan soal dan pilihannya disiapkan di sini agar jawaban yang
 * dikirim lewat API bisa divalidasi seperti pengisian warga.
 */
export async function buatSurveiDenganSoalUji(input: {
  judul: string;
  pertanyaan: string;
  pilihan: string[];
}): Promise<{ id: number; soalId: number }> {
  return denganPool(async (pool) => {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT village_id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const villageId = Number(users[0]?.village_id);
    if (!villageId) throw new Error("Desa admin E2E tidak ditemukan.");

    const [survei] = await pool.execute<ResultSetHeader>(
      `INSERT INTO survey (village_id, judul, deskripsi, sasaran, mulai, selesai, aktif)
       VALUES (?, ?, 'Survei uji formulir eksternal', 'Warga', '2020-01-01', '2099-12-31', 1)`,
      [villageId, input.judul],
    );
    const [soal] = await pool.execute<ResultSetHeader>(
      "INSERT INTO survey_soal (survey_id, pertanyaan, tipe, pilihan, urutan) VALUES (?, ?, 'choice', ?, 0)",
      [survei.insertId, input.pertanyaan, JSON.stringify(input.pilihan)],
    );
    return { id: survei.insertId, soalId: soal.insertId };
  });
}

/** Identitas desa lengkap yang dapat diubah lewat `/pengaturan/desa`. */
export interface IdentitasDesaLengkapUji {
  villageId: number;
  name: string | null;
  code: string | null;
  postalCode: string | null;
  district: string | null;
  districtCode: string | null;
  regency: string | null;
  regencyCode: string | null;
  province: string | null;
  provinceCode: string | null;
  officeAddress: string | null;
  headName: string | null;
  headNip: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo: string | null;
  signature: string | null;
  stamp: string | null;
  penomoranSurat: number;
}

/** Baca identitas desa admin untuk assertion dan pemulihan data uji. */
export async function bacaIdentitasDesaLengkapUji(): Promise<IdentitasDesaLengkapUji> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT name, code, postal_code, district, district_code, regency, regency_code,
              province, province_code, office_address, head_name, head_nip, email, phone,
              website, logo, signature, stamp, penomoran_surat
         FROM villages WHERE id = ? LIMIT 1`,
      [villageId],
    );
    const row = rows[0];
    if (!row) throw new Error("Identitas desa admin E2E tidak ditemukan.");
    return {
      villageId,
      name: row.name === null ? null : String(row.name),
      code: row.code === null ? null : String(row.code),
      postalCode: row.postal_code === null ? null : String(row.postal_code),
      district: row.district === null ? null : String(row.district),
      districtCode: row.district_code === null ? null : String(row.district_code),
      regency: row.regency === null ? null : String(row.regency),
      regencyCode: row.regency_code === null ? null : String(row.regency_code),
      province: row.province === null ? null : String(row.province),
      provinceCode: row.province_code === null ? null : String(row.province_code),
      officeAddress: row.office_address === null ? null : String(row.office_address),
      headName: row.head_name === null ? null : String(row.head_name),
      headNip: row.head_nip === null ? null : String(row.head_nip),
      email: row.email === null ? null : String(row.email),
      phone: row.phone === null ? null : String(row.phone),
      website: row.website === null ? null : String(row.website),
      logo: row.logo === null ? null : String(row.logo),
      signature: row.signature === null ? null : String(row.signature),
      stamp: row.stamp === null ? null : String(row.stamp),
      penomoranSurat: Number(row.penomoran_surat),
    };
  });
}

/** Pulihkan seluruh kolom identitas desa setelah test. */
export async function pulihkanIdentitasDesaLengkapUji(
  data: IdentitasDesaLengkapUji,
): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute(
      `UPDATE villages
          SET name = ?, code = ?, postal_code = ?, district = ?, district_code = ?,
              regency = ?, regency_code = ?, province = ?, province_code = ?,
              office_address = ?, head_name = ?, head_nip = ?, email = ?, phone = ?,
              website = ?, logo = ?, signature = ?, stamp = ?, penomoran_surat = ?
        WHERE id = ?`,
      [
        data.name,
        data.code,
        data.postalCode,
        data.district,
        data.districtCode,
        data.regency,
        data.regencyCode,
        data.province,
        data.provinceCode,
        data.officeAddress,
        data.headName,
        data.headNip,
        data.email,
        data.phone,
        data.website,
        data.logo,
        data.signature,
        data.stamp,
        data.penomoranSurat,
        data.villageId,
      ],
    );
  });
}

/** Setel ulang sandi/PIN akun uji ke nilai yang diketahui (mis. pemulihan setelah test gagal). */
export async function setelSandiPengguna(username: string, sandi: string): Promise<void> {
  const hash = await hashPassword(sandi);
  await denganPool(async (pool) => {
    await pool.execute(
      `UPDATE accounts SET password = ?
        WHERE provider_id = 'credential'
          AND user_id = (SELECT id FROM users WHERE username = ? LIMIT 1)`,
      [hash, username],
    );
  });
}

/** Hapus pengguna uji beserta akun/sesi (kaskade). */
export async function hapusPenggunaDariUsername(username: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM users WHERE username = ?", [username]);
  });
}

/** Hapus grup akses uji beserta izinnya (kaskade). */
export async function hapusGrupDariNama(nama: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM roles WHERE name = ?", [nama]);
  });
}

/** Hapus modul uji berdasarkan slug. */
export async function hapusModulDariSlug(slug: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM modules WHERE slug = ?", [slug]);
  });
}

/** Baca tingkat akses satu grup pada satu slug modul; `null` bila tidak ada. */
export async function bacaIzinGrupUji(namaGrup: string, slugModul: string): Promise<string | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT rp.access
         FROM roles r
         JOIN role_permissions rp ON rp.role_id = r.id
         JOIN modules m ON m.id = rp.module_id
        WHERE r.name = ? AND m.slug = ?
        LIMIT 1`,
      [namaGrup, slugModul],
    );
    return rows[0] ? String(rows[0].access) : null;
  });
}

/** Buat API key eksternal untuk desa admin (atau desa tertentu) dan kembalikan kunci mentah. */
export async function buatApiKeyUji(input?: {
  name?: string;
  villageId?: number;
}): Promise<{ id: number; key: string; villageId: number }> {
  return denganPool(async (pool) => {
    const villageId = input?.villageId ?? (await desaAdmin(pool));
    const key = `SID_${randomBytes(24).toString("hex")}`;
    const hashedKey = createHash("sha256").update(key).digest("hex");
    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO api_keys (village_id, name, hashed_key, prefix, rate_limit, active)
       VALUES (?, ?, ?, 'SID_', 100, 1)`,
      [villageId, input?.name ?? `E2E ${Date.now()}`, hashedKey],
    );
    return { id: hasil.insertId, key, villageId };
  });
}

/** Buat desa fixture untuk menguji scoping beberapa API key. */
export async function buatDesaLainApiKeyUji(): Promise<number> {
  return denganPool(async (pool) => {
    const kode = `AK${Date.now().toString().slice(-8)}`;
    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO villages (name, code, slug, active) VALUES (?, ?, ?, 1)",
      [`Desa API Lain ${kode}`, kode, `desa-api-${kode.toLowerCase()}`],
    );
    return hasil.insertId;
  });
}

/** Hapus desa fixture API key; key harus sudah dihapus lebih dulu. */
export async function hapusDesaLainApiKeyUji(id: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM villages WHERE id = ?", [id]);
  });
}

/** Hapus API key uji. */
export async function hapusApiKeyUji(id: number): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM api_keys WHERE id = ?", [id]);
  });
}

/** Penduduk dan jenis surat tanpa syarat untuk uji API eksternal. */
export interface KonteksSuratEksternalUji {
  villageId: number;
  residentId: number;
  nik: string;
  namaPenduduk: string;
  letterTypeId: number;
  letterTypeName: string;
}

/** Siapkan konteks permohonan surat lewat API tanpa bergantung pada urutan seed. */
export async function siapkanSuratEksternalUji(): Promise<KonteksSuratEksternalUji> {
  return denganPool(async (pool) => {
    const villageId = await desaAdmin(pool);
    const [penduduk] = await pool.query<RowDataPacket[]>(
      `SELECT id, national_id, name FROM residents
        WHERE village_id = ? AND national_id REGEXP '^[0-9]{16}$'
        ORDER BY id LIMIT 1`,
      [villageId],
    );
    const [jenis] = await pool.query<RowDataPacket[]>(
      `SELECT id, name FROM letter_types
        WHERE village_id = ? AND is_active = 1
          AND COALESCE(JSON_LENGTH(syarat_surat), 0) = 0
        ORDER BY sort_order, id LIMIT 1`,
      [villageId],
    );
    if (!penduduk[0]?.national_id)
      throw new Error("Penduduk NIK 16 digit desa E2E tidak ditemukan.");
    if (!jenis[0]?.id) throw new Error("Jenis surat tanpa syarat desa E2E tidak ditemukan.");
    return {
      villageId,
      residentId: Number(penduduk[0].id),
      nik: String(penduduk[0].national_id),
      namaPenduduk: String(penduduk[0].name),
      letterTypeId: Number(jenis[0].id),
      letterTypeName: String(jenis[0].name),
    };
  });
}

/** Baca permohonan yang dibuat API eksternal berdasarkan keterangan unik. */
export async function bacaPermohonanEksternalUji(keterangan: string): Promise<{
  id: number;
  villageId: number;
  residentId: number;
  letterTypeId: number;
  noAntrian: string | null;
  isianForm: string | null;
  syarat: string | null;
} | null> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, village_id, resident_id, letter_type_id, no_antrian, isian_form, syarat
         FROM permohonan_surat WHERE keterangan = ? ORDER BY id DESC LIMIT 1`,
      [keterangan],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: Number(row.id),
      villageId: Number(row.village_id),
      residentId: Number(row.resident_id),
      letterTypeId: Number(row.letter_type_id),
      noAntrian: row.no_antrian === null ? null : String(row.no_antrian),
      isianForm: row.isian_form === null ? null : String(row.isian_form),
      syarat: row.syarat === null ? null : String(row.syarat),
    };
  });
}

/** Hapus permohonan uji API eksternal berdasarkan keterangan. */
export async function hapusPermohonanEksternalUji(keterangan: string): Promise<void> {
  await denganPool(async (pool) => {
    await pool.execute("DELETE FROM permohonan_surat WHERE keterangan = ?", [keterangan]);
  });
}

/** Apakah audit event tertentu sudah tercatat untuk resource tertentu. */
export async function adaAuditEventUji(event: string, resourceId: string): Promise<boolean> {
  return denganPool(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM audit_logs WHERE event = ? AND resource_id = ? LIMIT 1",
      [event, resourceId],
    );
    return Boolean(rows[0]);
  });
}
