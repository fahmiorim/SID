import "server-only";

import {
  identitasCocok,
  normalisasiNomorTiket,
  normalizeKategori,
  normalizeStatus,
  type LacakPengaduanInput,
  type PengaduanLacak,
} from "@/features/pengaduan/domain/pengaduan";
import { getPengaduanByTiket } from "@/features/pengaduan/infrastructure/pengaduan-repository";

/**
 * Lacak status pengaduan dari halaman publik.
 *
 * Nomor tiket saja **tidak cukup**: tiket memakai urutan harian sehingga mudah
 * ditebak. Pemanggil harus menyertakan salah satu identitas yang diisi saat
 * mengirim (NIK, telepon, atau email). Bila tidak cocok, hasilnya `null` —
 * bukan pesan berbeda — agar tidak membocorkan keberadaan tiket.
 */
export async function lacakPengaduanData(
  villageId: number,
  input: LacakPengaduanInput,
): Promise<PengaduanLacak | null> {
  const nomorTiket = normalisasiNomorTiket(input.nomorTiket);
  const row = await getPengaduanByTiket(villageId, nomorTiket);

  if (!row) return null;
  if (!identitasCocok(row, input.identitas)) return null;

  return {
    nomorTiket: row.nomorTiket,
    kategori: normalizeKategori(row.kategori),
    judul: row.judul,
    isi: row.isi,
    status: normalizeStatus(row.status),
    tanggapan: row.tanggapan,
    ditanggapiPada: row.ditanggapiPada,
    createdAt: row.createdAt,
  };
}
