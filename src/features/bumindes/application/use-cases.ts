import "server-only";

import { nomorUrutBerikutnya, type ItemBukuInput } from "@/features/bumindes/domain/bumindes";
import {
  deleteBumindesItem,
  ensureBumindesBuku,
  getBumindesBuku,
  getBumindesItem,
  insertBumindesItem,
  listBumindesItem,
  nomorUrutTerpakai,
  updateBumindesItem,
} from "@/features/bumindes/infrastructure/bumindes-repository";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/**
 * Use case buku administrasi desa.
 *
 * Izin ditegakkan di sini (bukan di halaman), sehingga pemanggil mana pun
 * terlindungi. Setiap fungsi menerima desa dari sesi via `resolveVillageId`.
 */

/** Daftar buku desa; katalog buku inti dipastikan ada lebih dulu. */
export async function getDaftarBukuData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  return ensureBumindesBuku(villageId);
}

/**
 * Detail satu buku beserta itemnya.
 *
 * Mengembalikan `null` bila buku tidak ada di desa sesi, agar halaman dapat
 * memanggil `notFound()` sesuai konvensi Next.
 */
export async function getBukuDetailData(bukuId: number) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);

  const buku = await getBumindesBuku(villageId, bukuId);
  if (!buku) return null;

  const items = await listBumindesItem(villageId, bukuId);
  return { buku, items, nomorUrutBerikutnya: nomorUrutBerikutnya(items) };
}

/**
 * Simpan item buku (tambah bila `id` kosong, ubah bila ada).
 *
 * Nomor urut harus unik per buku. Pemeriksaan dilakukan di server tepat sebelum
 * menulis; database belum memasang indeks unik karena data lama mungkin sudah
 * berisi nomor ganda (dibuat sebelum aturan ini ada).
 */
export async function simpanItemBukuData(
  id: number | null,
  input: ItemBukuInput,
): Promise<{ id: number; bukuId: number }> {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);

  // Pada pengubahan, buku mengikuti item tersimpan — bukan nilai form.
  const existing = id === null ? null : await getBumindesItem(villageId, id);
  if (id !== null && !existing) throw notFound("Item buku tidak ditemukan.");

  const bukuId = existing?.bukuId ?? input.bukuId;
  const buku = await getBumindesBuku(villageId, bukuId);
  if (!buku) throw notFound("Buku administrasi tidak ditemukan.");

  if (await nomorUrutTerpakai(villageId, bukuId, input.nomorUrut, id)) {
    throw conflict(`Nomor urut ${input.nomorUrut} sudah dipakai pada buku ini.`);
  }

  const values = {
    nomorUrut: input.nomorUrut,
    tanggal: input.tanggal,
    uraian: input.uraian,
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };

  if (existing) {
    await updateBumindesItem(villageId, existing.id, values);
    return { id: existing.id, bukuId };
  }

  const baru = await insertBumindesItem(villageId, { bukuId, ...values });
  return { id: baru, bukuId };
}

/** Hapus item buku milik desa sesi; mengembalikan buku asalnya. */
export async function hapusItemBukuData(id: number): Promise<{ bukuId: number }> {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);

  const existing = await getBumindesItem(villageId, id);
  if (!existing) throw notFound("Item buku tidak ditemukan.");

  await deleteBumindesItem(villageId, id);
  return { bukuId: existing.bukuId };
}
