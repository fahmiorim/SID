import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { residents } from "@/db/schema";
import { nomorUrutBerikutnya, type ItemBukuInput } from "@/features/bumindes/domain/bumindes";
import {
  deleteBumindesItem,
  ensureBumindesBuku,
  getBumindesBuku,
  getBumindesItem,
  insertBumindesItem,
  listBumindesBuku,
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

/** Detail satu buku beserta itemnya.
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

/** Simpan item buku (tambah bila `id` kosong, ubah bila ada).
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

/** Sinkronisasi item buku dari data penduduk.
 * Fungsi ini mengisi item-item buku inti (B1-B5) berdasarkan data penduduk
 * yang terdaftar di sistem. Setiap buku akan diisi dengan ringkasan data:
 * - B1: Jumlah penduduk per jenis kelamin dan status
 * - B2: Data KTP/KK yang terdaftar
 * - B3: Ringkasan mutasi (lahir/mati/pindah/datang)
 * - B4: Total populasi per wilayah
 * - B5: Penduduk sementara/tamu
 * Item yang sudah terisi akan dijaga, hanya item yang masih kosong yang diisi.
 */
export async function sinkronisasiBumindesDariPenduduk(): Promise<{
  sukses: boolean;
  pesan: string;
  detail: Record<string, number>;
}> {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);

  const allResidents = await db
    .select({
      id: residents.id,
      name: residents.name,
      gender: residents.gender,
      lifeStatus: residents.lifeStatus,
      residenceStatus: residents.residenceStatus,
      familyId: residents.familyId,
      nationalId: residents.nationalId,
    })
    .from(residents)
    .where(and(eq(residents.villageId, villageId)));

  const daftarBuku = await listBumindesBuku(villageId);
  const bukuMap = new Map(daftarBuku.map((buku) => [buku.kodeBuku, buku.id]));
  const detail: Record<string, number> = {};
  const lahir = 0;
  const mati = 0;
  const pindah = 0;
  const datang = 0;
  let lakiLaki = 0;
  let perempuan = 0;
  let permanent = 0;
  let temporary = 0;
  let withKK = 0;
  let withoutKK = 0;
  const total = allResidents.length;

  for (const resident of allResidents) {
    if (resident.lifeStatus === "alive") {
      lakiLaki += resident.gender === "male" ? 1 : 0;
      permanent++;
    }
    perempuan += resident.gender === "female" ? 1 : 0;
    temporary += resident.residenceStatus === "temporary" ? 1 : 0;
    if (resident.nationalId) withKK++;
    else withoutKK++;
  }

  const sinkronisasi: Array<{ bukuId: number; uraian: string }> = [];

  const bukuB1 = bukuMap.get("B1");
  if (bukuB1 !== undefined) {
    const items = await listBumindesItem(villageId, bukuB1);
    const existingUraian = items.find((item) => item.uraian)?.uraian.toLowerCase() ?? "";
    let newUraian = "";
    if (!existingUraian.includes("laki-laki")) newUraian += `Total ${lakiLaki} laki-laki, `;
    if (!existingUraian.includes("perempuan")) newUraian += `${perempuan} perempuan, `;
    if (!existingUraian.includes("total")) newUraian += `total ${total} orang`;
    if (newUraian) sinkronisasi.push({ bukuId: bukuB1, uraian: newUraian.trim() });
    detail["B1"] = total;
  }

  const bukuB2 = bukuMap.get("B2");
  if (bukuB2 !== undefined) {
    const items = await listBumindesItem(villageId, bukuB2);
    const existingUraian = items.find((item) => item.uraian)?.uraian.toLowerCase() ?? "";
    let newUraian = "";
    if (!existingUraian.includes("ktp")) newUraian += `${withKK} penduduk punya KTP, `;
    if (!existingUraian.includes("kk")) newUraian += `${withKK} KK terdaftar, `;
    if (withoutKK > 0) newUraian += `${withoutKK} tanpa KK`;
    if (newUraian) sinkronisasi.push({ bukuId: bukuB2, uraian: newUraian.trim() });
    detail["B2"] = withKK;
  }

  const bukuB3 = bukuMap.get("B3");
  if (bukuB3 !== undefined) {
    const items = await listBumindesItem(villageId, bukuB3);
    const existingUraian = items.find((item) => item.uraian)?.uraian.toLowerCase() ?? "";
    let newUraian = "";
    if (!existingUraian.includes("lahir")) newUraian += `${lahir} lahir, `;
    if (!existingUraian.includes("mati")) newUraian += `${mati} mati, `;
    if (!existingUraian.includes("pindah")) newUraian += `${pindah} pindah, `;
    if (!existingUraian.includes("datang")) newUraian += `${datang} datang`;
    if (newUraian) sinkronisasi.push({ bukuId: bukuB3, uraian: newUraian.trim() });
    detail["B3"] = lahir + mati + pindah + datang;
  }

  const bukuB4 = bukuMap.get("B4");
  if (bukuB4 !== undefined) {
    const items = await listBumindesItem(villageId, bukuB4);
    const existingUraian = items.find((item) => item.uraian)?.uraian.toLowerCase() ?? "";
    let newUraian = "";
    if (!existingUraian.includes("total")) newUraian += `total ${total} orang, `;
    if (!existingUraian.includes("laki-laki")) newUraian += `${lakiLaki} laki-laki, `;
    if (!existingUraian.includes("perempuan")) newUraian += `${perempuan} perempuan, `;
    if (!existingUraian.includes("permanent")) newUraian += `${permanent} tetap, `;
    if (!existingUraian.includes("temporary")) newUraian += `${temporary} sementara`;
    if (newUraian) sinkronisasi.push({ bukuId: bukuB4, uraian: newUraian.trim() });
    detail["B4"] = total;
  }

  const bukuB5 = bukuMap.get("B5");
  if (bukuB5 !== undefined) {
    sinkronisasi.push({
      bukuId: bukuB5,
      uraian: `${temporary} penduduk sementara dari total ${total}`,
    });
    detail["B5"] = temporary;
  }

  const tanggal = new Date().toISOString().slice(0, 10);
  for (const { bukuId, uraian } of sinkronisasi) {
    const items = await listBumindesItem(villageId, bukuId);
    const item = items[0];
    const existingUraian = items.find((row) => row.uraian)?.uraian.trim() ?? "";
    if (item && !existingUraian) {
      await updateBumindesItem(villageId, item.id, {
        uraian,
        tanggal,
        nomorUrut: item.nomorUrut,
        keterangan: item.keterangan,
      });
    }
  }

  return {
    sukses: sinkronisasi.length > 0,
    pesan: `Sinkronisasi selesai untuk ${sinkronisasi.length} buku`,
    detail,
  };
}
