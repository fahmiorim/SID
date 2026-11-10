/**
 * Utilitas tanggal untuk seeder Desa Kwala Gunung.
 *
 * Semua tanggal seed dihitung relatif terhadap hari ini agar konten publik
 * (agenda mendatang, berita terbaru, periode bantuan) tetap relevan kapan pun
 * seeder dijalankan — bukan terkunci pada tahun tertentu.
 */

/** Tanggal ISO `YYYY-MM-DD` sejumlah `hari` dari hari ini (negatif = lampau). */
export function tanggalRelatif(hari: number): string {
  const tanggal = new Date();
  tanggal.setUTCHours(12, 0, 0, 0);
  tanggal.setUTCDate(tanggal.getUTCDate() + hari);
  return tanggal.toISOString().slice(0, 10);
}

/** Waktu `Date` sejumlah `hari` dari hari ini pada jam tertentu (UTC). */
export function waktuRelatif(hari: number, jam = 9, menit = 0): Date {
  const tanggal = new Date();
  tanggal.setUTCHours(jam, menit, 0, 0);
  tanggal.setUTCDate(tanggal.getUTCDate() + hari);
  return tanggal;
}

/** Tahun berjalan. */
export const TAHUN_INI = new Date().getUTCFullYear();

/** Tanggal hari ini dalam format ISO. */
export const HARI_INI = tanggalRelatif(0);
