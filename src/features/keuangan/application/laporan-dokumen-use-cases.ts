import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { LAPORAN_KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import {
  berkasLaporanAman,
  laporanDokumenFormSchema,
  MAKS_UKURAN_BERKAS,
  rangkumPeriode,
  validasiBerkasLaporan,
  type LaporanDokumenInput,
} from "@/features/keuangan/domain/laporan-dokumen";
import {
  adaLaporanSama,
  deleteLaporanDokumen,
  findLaporanDokumen,
  insertLaporanDokumen,
  listLaporanDokumen,
  setLaporanDiserahkan,
  updateLaporanDokumen,
} from "@/features/keuangan/infrastructure/laporan-dokumen-repository";
import {
  bacaBerkasLaporan,
  hapusBerkasLaporan,
  jalurRelatifLaporan,
  simpanBerkasLaporan,
} from "@/features/keuangan/infrastructure/laporan-storage";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

/** Data berkas yang sudah dibaca dari `FormData` (sudah lolos validasi). */
export interface BerkasLaporanInput {
  nama: string;
  tipe: string;
  isi: Uint8Array;
}

function parseMetadata(input: unknown): LaporanDokumenInput {
  const parsed = laporanDokumenFormSchema.safeParse(input);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "Data laporan tidak valid.");
  }
  return parsed.data;
}

/**
 * Daftar dokumen laporan desa beserta rangkuman kelengkapan periode.
 *
 * Rangkuman dihitung untuk tahun terpilih; bila tahun belum diketahui, dipakai
 * tahun dokumen terbaru (atau tahun berjalan).
 */
export async function listLaporanKeuanganDokumen(tahunParam?: number) {
  const user = await requirePermission(LAPORAN_KEUANGAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const rows = await listLaporanDokumen(villageId);
  const tahunTersedia = [...new Set(rows.map((row) => row.tahun))].sort((a, b) => a - b);

  const tahun =
    tahunParam !== undefined && Number.isInteger(tahunParam)
      ? tahunParam
      : (tahunTersedia.at(-1) ?? new Date().getFullYear());

  return {
    villageId,
    tahun,
    tahunTersedia,
    rows,
    periode: rangkumPeriode(rows, tahun),
  };
}

/**
 * Simpan dokumen laporan: unggah baru atau ganti berkas yang sudah ada.
 *
 * Satu (tipe, tahun, semester) hanya boleh punya satu dokumen; penggantian
 * berarti menimpa berkas lama.
 */
export async function saveLaporanKeuanganDokumen(input: {
  metadata: unknown;
  berkas: BerkasLaporanInput | null;
  id?: number;
}) {
  const user = await requirePermission(LAPORAN_KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const metadata = parseMetadata(input.metadata);

  const pesanBerkas = validasiBerkasLaporan(
    input.berkas
      ? { nama: input.berkas.nama, ukuran: input.berkas.isi.byteLength, tipe: input.berkas.tipe }
      : null,
  );
  if (pesanBerkas) throw conflict(pesanBerkas);

  if (input.berkas && input.berkas.isi.byteLength > MAKS_UKURAN_BERKAS) {
    throw conflict("Ukuran berkas maksimal 8 MB.");
  }

  const kembar = await adaLaporanSama(
    villageId,
    metadata.tipe,
    metadata.tahun,
    metadata.semester,
    input.id,
  );
  if (kembar) {
    throw conflict("Dokumen untuk jenis, tahun, dan semester tersebut sudah ada.");
  }

  const namaAman = berkasLaporanAman(input.berkas?.nama ?? "laporan.pdf");
  const relatif = jalurRelatifLaporan(villageId, metadata.tahun, namaAman);

  // Baca berkas sebelum menyentuh DB supaya kegagalan I/O tidak menyisakan
  // baris tanpa berkas.
  if (!input.berkas) throw conflict("Berkas laporan wajib dipilih.");

  const lama = input.id !== undefined ? await findLaporanDokumen(villageId, input.id) : null;

  await simpanBerkasLaporan(relatif, input.berkas.isi);

  try {
    if (lama) {
      await updateLaporanDokumen(villageId, lama.id, {
        tipe: metadata.tipe,
        judul: metadata.judul,
        tahun: metadata.tahun,
        semester: metadata.semester,
        namaFile: input.berkas.nama,
        jalurFile: relatif,
        ukuranFile: input.berkas.isi.byteLength,
      });
      // Berkas lama baru dihapus setelah baris tersimpan.
      if (lama.jalurFile !== relatif) await hapusBerkasLaporan(lama.jalurFile);
      return { id: lama.id };
    }

    const id = await insertLaporanDokumen(villageId, {
      tipe: metadata.tipe,
      judul: metadata.judul,
      tahun: metadata.tahun,
      semester: metadata.semester,
      namaFile: input.berkas.nama,
      jalurFile: relatif,
      ukuranFile: input.berkas.isi.byteLength,
      createdBy: user.id,
    });
    return { id };
  } catch (error) {
    // Baris gagal disimpan → berkas baru tidak ada gunanya.
    await hapusBerkasLaporan(relatif);
    throw error;
  }
}

/** Ambil isi berkas laporan untuk diunduh. */
export async function getLaporanKeuanganDokumenBerkas(id: number) {
  const user = await requirePermission(LAPORAN_KEUANGAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const row = await findLaporanDokumen(villageId, id);
  if (!row) throw notFound("Dokumen laporan tidak ditemukan.");

  const isi = await bacaBerkasLaporan(row.jalurFile);
  return { row, isi };
}

/** Catat tanggal penyerahan laporan; `null` mengosongkan catatan tersebut. */
export async function setLaporanKeuanganDiserahkan(id: number, diserahkanPada: string | null) {
  const user = await requirePermission(LAPORAN_KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const row = await findLaporanDokumen(villageId, id);
  if (!row) throw notFound("Dokumen laporan tidak ditemukan.");

  const tanggal = diserahkanPada?.trim() ? diserahkanPada : null;
  if (tanggal && Number.isNaN(new Date(tanggal).getTime())) {
    throw validationError("Tanggal penyerahan tidak valid.");
  }

  await setLaporanDiserahkan(villageId, id, tanggal ? new Date(tanggal) : null);
  return { id };
}

/** Hapus dokumen laporan beserta berkasnya. */
export async function deleteLaporanKeuanganDokumen(id: number) {
  const user = await requirePermission(LAPORAN_KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const row = await findLaporanDokumen(villageId, id);
  if (!row) throw notFound("Dokumen laporan tidak ditemukan.");

  await deleteLaporanDokumen(villageId, id);
  await hapusBerkasLaporan(row.jalurFile);
  return { id };
}
