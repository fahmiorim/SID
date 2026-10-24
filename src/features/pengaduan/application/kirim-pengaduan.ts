import "server-only";

import {
  formatNomorTiket,
  prefiksNomorTiket,
  type PengaduanInput,
} from "@/features/pengaduan/domain/pengaduan";
import {
  countTiketPadaTanggal,
  insertPengaduan,
} from "@/features/pengaduan/infrastructure/pengaduan-repository";
import { validasiBerkasSyarat, type BerkasUnggahan } from "@/features/publik/domain/media";
import { hapusMedia, simpanUnggahanMedia } from "@/features/publik/infrastructure/media-storage";
import { validationError } from "@/lib/errors";

/**
 * Pengiriman pengaduan oleh warga.
 *
 * Berbeda dari use case admin, di sini **tidak ada** pemeriksaan izin: siapa pun
 * yang membuka situs desa boleh menyampaikan pengaduan. Yang dijaga adalah
 * tenant (`villageId` dari host) dan nomor tiket yang dibuat server.
 */

const MAKS_PERCOBAAN_TIKET = 3;

function duplikat(error: unknown): boolean {
  return (error as { code?: string }).code === "ER_DUP_ENTRY";
}

/**
 * Lampiran pengaduan disimpan pada kategori **non-publik** sehingga tidak dapat
 * diunduh lewat route media publik; hanya petugas ber-izin yang bisa membukanya.
 *
 * Tipe berkas dibatasi JPG/PNG/WEBP/PDF (tanpa SVG/GIF) karena berkas ini
 * disajikan inline pada origin aplikasi.
 */
export async function simpanLampiranPengaduan(
  villageId: number,
  berkas: BerkasUnggahan,
): Promise<string> {
  const validasi = validasiBerkasSyarat(berkas.mime, berkas.ukuran);
  if (!validasi.ok) {
    throw validationError(validasi.pesan, { lampiran: [validasi.pesan] });
  }

  const hasil = await simpanUnggahanMedia(villageId, "pengaduan", berkas);
  return hasil.jalur;
}

export interface HasilKirimPengaduan {
  id: number;
  nomorTiket: string;
}

/**
 * Simpan pengaduan baru dan kembalikan nomor tiketnya.
 *
 * Nomor tiket memakai urutan harian. Dua pengiriman bersamaan bisa memilih
 * nomor yang sama; indeks unik `(village_id, nomor_tiket)` menolaknya dan
 * penyimpanan diulang dengan nomor berikutnya.
 */
export async function kirimPengaduanData(
  villageId: number,
  input: PengaduanInput,
  lampiran: string | null = null,
): Promise<HasilKirimPengaduan> {
  const sekarang = new Date();
  const prefiks = prefiksNomorTiket(sekarang);

  try {
    for (let percobaan = 1; percobaan <= MAKS_PERCOBAAN_TIKET; percobaan += 1) {
      const urutan = (await countTiketPadaTanggal(villageId, prefiks)) + 1;
      const nomorTiket = formatNomorTiket(sekarang, urutan);

      try {
        const id = await insertPengaduan(villageId, {
          nomorTiket,
          kategori: input.kategori,
          judul: input.judul,
          isi: input.isi,
          namaPelapor: input.namaPelapor,
          nik: input.nik,
          telepon: input.telepon,
          email: input.email,
          alamat: input.alamat,
          lampiran,
        });

        return { id, nomorTiket };
      } catch (error) {
        if (!duplikat(error) || percobaan === MAKS_PERCOBAAN_TIKET) throw error;
      }
    }

    throw new Error("Gagal membuat nomor tiket pengaduan.");
  } catch (error) {
    // Jangan tinggalkan lampiran yatim bila pengaduan gagal disimpan.
    if (lampiran) await hapusMedia(lampiran).catch(() => undefined);
    throw error;
  }
}
