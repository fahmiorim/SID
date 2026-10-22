import "server-only";

import {
  AKUN_LAPORAN,
  formatMoney,
  laporanRpApbd,
  listBidangBelanja,
  realisasiPersen,
  seriGrafik,
  toMinor,
  totalLaporan,
} from "@/features/keuangan/domain/keuangan";
import {
  listKeuanganTahun,
  listKeuanganTahunTersedia,
} from "@/features/keuangan/infrastructure/keuangan-repository";

/**
 * Laporan APBDes untuk **situs publik**.
 *
 * Berbeda dari `getLaporanKeuangan()` (jalur admin yang memeriksa izin), fungsi
 * ini hanya butuh `villageId` dari host sehingga warga tanpa akun tetap dapat
 * melihat transparansi anggaran. Isi laporan identik karena keduanya memakai
 * fungsi murni yang sama di `domain/keuangan.ts`.
 */
export async function getLaporanApbdesPublik(villageId: number) {
  const tersedia = await listKeuanganTahunTersedia(villageId);
  const tahun = tersedia.at(-1) ?? new Date().getFullYear();

  const rows = await listKeuanganTahun(villageId, tahun);
  const baris = laporanRpApbd(rows, AKUN_LAPORAN);
  const bidang = listBidangBelanja(rows).map((row) => ({
    kode: row.templateUuid,
    uraian: row.uraian,
    anggaran: row.anggaran,
    realisasi: row.realisasi,
    selisih: formatMoney(toMinor(row.anggaran) - toMinor(row.realisasi)),
    persen: realisasiPersen(row.anggaran, row.realisasi),
  }));

  return {
    tahun,
    tersedia,
    baris,
    total: totalLaporan(baris),
    bidang,
    totalBidang: totalLaporan(bidang),
    grafik: seriGrafik(baris),
  };
}
