import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  normalizeKategori,
  samarkanNama,
  type PengaduanPublikRow,
  type StatusPengaduan,
  type TanggapanInput,
} from "@/features/pengaduan/domain/pengaduan";
import {
  deletePengaduan,
  getPengaduan,
  listPengaduan,
  listPengaduanPublik,
  setPublikPengaduan,
  updateTanggapanPengaduan,
} from "@/features/pengaduan/infrastructure/pengaduan-repository";
import { hapusMedia } from "@/features/publik/infrastructure/media-storage";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";
import { notFound } from "@/lib/errors";

import { notifikasiStatusPengaduan } from "./notification";

/**
 * Use case pengaduan untuk panel admin.
 *
 * Izin diperiksa di sini (bukan di Server Action) agar aturan yang sama berlaku
 * baik saat dipanggil dari halaman maupun langsung.
 */

export interface FilterPengaduanData {
  status?: StatusPengaduan;
  kategori?: string;
  cari?: string;
}

/** Daftar pengaduan desa sesuai filter (terbaru lebih dulu). */
export async function listPengaduanData(filter: FilterPengaduanData = {}) {
  const user = await requirePermission(RESOURCES.pengaduan, "read");
  const villageId = await resolveVillageId(user);
  return listPengaduan(villageId, filter);
}

/** Detail satu pengaduan; `null` bila bukan milik desa sesi. */
export async function getPengaduanDetailData(id: number) {
  const user = await requirePermission(RESOURCES.pengaduan, "read");
  const villageId = await resolveVillageId(user);
  return getPengaduan(villageId, id);
}

/** Simpan status & tanggapan petugas. */
export async function tanggapiPengaduanData(
  id: number,
  input: TanggapanInput,
): Promise<{ id: number }> {
  const user = await requirePermission(RESOURCES.pengaduan, "update");
  const villageId = await resolveVillageId(user);

  const pengaduan = await getPengaduan(villageId, id);
  if (!pengaduan) throw notFound("Pengaduan tidak ditemukan.");

  await updateTanggapanPengaduan(villageId, id, {
    status: input.status,
    tanggapan: input.tanggapan,
    publik: input.publik,
    petugasId: user.id,
    ditanggapiPada: new Date(),
  });

  // Kirim notifikasi ke pelapor setelah status berubah
  const statusBaru = input.status;
  const statusLama = pengaduan.status;
  const emailPelapor = pengaduan.email;
  const namaPelapor = pengaduan.namaPelapor;
  const nomorTiket = pengaduan.nomorTiket;

  await notifikasiStatusPengaduan({
    id,
    nomorTiket,
    statusLama,
    statusBaru,
    emailPelapor,
    namaPelapor,
  });

  return { id };
}

/** Tandai pengaduan boleh tampil di halaman publik. */
export async function setPublikPengaduanData(id: number, publik: boolean): Promise<{ id: number }> {
  const user = await requirePermission(RESOURCES.pengaduan, "update");
  const villageId = await resolveVillageId(user);

  const updated = await setPublikPengaduan(villageId, id, publik);
  if (!updated) throw notFound("Pengaduan tidak ditemukan.");

  // Kirim notifikasi jika pengaduan dipublikasikan ke halaman publik
  if (publik) {
    const pengaduan = await getPengaduan(villageId, id);
    if (pengaduan && pengaduan.email) {
      await notifikasiStatusPengaduan({
        id: pengaduan.id,
        nomorTiket: pengaduan.nomorTiket,
        statusLama: pengaduan.status,
        statusBaru: pengaduan.status,
        emailPelapor: pengaduan.email,
        namaPelapor: pengaduan.namaPelapor,
      });
    }
  }

  return { id };
}

/** Hapus pengaduan beserta lampirannya. */
export async function hapusPengaduanData(id: number): Promise<void> {
  const user = await requirePermission(RESOURCES.pengaduan, "delete");
  const villageId = await resolveVillageId(user);

  const pengaduan = await getPengaduan(villageId, id);
  if (!pengaduan) throw notFound("Pengaduan tidak ditemukan.");

  await deletePengaduan(villageId, id);
  if (pengaduan.lampiran) {
    // Media yang gagal dihapus tidak boleh menggagalkan penghapusan data.
    await hapusMedia(pengaduan.lampiran).catch(() => undefined);
  }
}

/**
 * Pengaduan untuk halaman publik.
 *
 * Identitas pelapor disamarkan dan hanya pengaduan bertanda `publik` yang
 * dikembalikan. `villageId` berasal dari host permintaan, bukan sesi.
 */
export async function listPengaduanPublikData(villageId: number): Promise<PengaduanPublikRow[]> {
  const rows = await listPengaduanPublik(villageId);

  return rows.map((row) => ({
    ...row,
    kategori: normalizeKategori(row.kategori),
    namaPelapor: samarkanNama(row.namaPelapor),
  }));
}
