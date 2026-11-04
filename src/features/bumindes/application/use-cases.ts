import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { residents } from "@/db/schema";
/* -------------------------------------------------------------------------- */
/* OS-FIN-010: Riwayat mutasi penduduk dalam buku resmi                        */
/* -------------------------------------------------------------------------- */ import {
  bukuResmiCsv,
  namaBerkasBuku,
  tabelAgenda,
  tabelAparat,
  tabelItemBuku,
  tabelKader,
  tabelMutasiPenduduk,
  tabelMutasiTanahKas,
  tabelPembangunan,
  tabelPeraturan,
  tabelTanahKas,
} from "@/features/bumindes/domain/buku-resmi";
import { nomorUrutBerikutnya, type ItemBukuInput } from "@/features/bumindes/domain/bumindes";
/* -------------------------------------------------------------------------- */
/* OS-FIN-012: Pembangunan & Kader                                             */
/* -------------------------------------------------------------------------- */
import type { KaderInput, PembangunanInput } from "@/features/bumindes/domain/pembangunan";
/* -------------------------------------------------------------------------- */
/* OS-FIN-013: Sekretariat                                                     */
/* -------------------------------------------------------------------------- */
import type {
  AgendaInput,
  AparatInput,
  PeraturanInput,
} from "@/features/bumindes/domain/sekretariat";
/* -------------------------------------------------------------------------- */
/* OS-FIN-011: Tanah Kas Desa                                                  */
/* -------------------------------------------------------------------------- */
import type { TanahKasInput, TanahKasMutasiInput } from "@/features/bumindes/domain/tanah-kas";
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
import {
  deleteBumindesKader,
  deleteBumindesPembangunan,
  insertBumindesKader,
  insertBumindesPembangunan,
  listBumindesKader,
  listBumindesPembangunan,
  updateBumindesKader,
  updateBumindesPembangunan,
} from "@/features/bumindes/infrastructure/pembangunan-repository";
import {
  deleteBumindesAgenda,
  deleteBumindesAparat,
  deleteBumindesPeraturan,
  insertBumindesAgenda,
  insertBumindesAparat,
  insertBumindesPeraturan,
  listBumindesAgenda,
  listBumindesAparat,
  listBumindesPeraturan,
  updateBumindesAgenda,
  updateBumindesAparat,
  updateBumindesPeraturan,
} from "@/features/bumindes/infrastructure/sekretariat-repository";
import {
  deleteBumindesTanahKas,
  deleteBumindesTanahKasMutasi,
  getBumindesTanahKas,
  insertBumindesTanahKas,
  insertBumindesTanahKasMutasi,
  listBumindesTanahKas,
  listBumindesTanahKasMutasi,
  updateBumindesTanahKas,
} from "@/features/bumindes/infrastructure/tanah-kas-repository";
import { getIdentitasByVillage } from "@/features/desa/application/get-identitas";
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

/** Data keluaran resmi (cetak) satu buku generik: buku, identitas desa, tabel. */
export async function getBukuCetakData(bukuId: number) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);

  const buku = await getBumindesBuku(villageId, bukuId);
  if (!buku) return null;

  const items = await listBumindesItem(villageId, bukuId);
  const desa = await getIdentitasByVillage(villageId);
  return { buku, desa, tabel: tabelItemBuku(buku.kodeBuku, buku.namaBuku, items) };
}

/** CSV satu buku generik; `null` bila buku tidak ada di desa sesi. */
export async function exportBukuCsvData(
  bukuId: number,
): Promise<{ csv: string; filename: string } | null> {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);

  const buku = await getBumindesBuku(villageId, bukuId);
  if (!buku) return null;

  const items = await listBumindesItem(villageId, bukuId);
  const desa = await getIdentitasByVillage(villageId);
  const tabel = tabelItemBuku(buku.kodeBuku, buku.namaBuku, items);
  return {
    csv: bukuResmiCsv(tabel),
    filename: namaBerkasBuku(buku.kodeBuku, desa?.namaDesa ?? null),
  };
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

export async function getDaftarTanahKasData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, mutasi] = await Promise.all([
    listBumindesTanahKas(villageId),
    listBumindesTanahKasMutasi(villageId),
  ]);
  return { items, mutasi };
}

export async function simpanTanahKasData(id: number | null, input: TanahKasInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const values = {
    nomorPersil: input.nomorPersil.trim(),
    asal: input.asal?.trim() ? input.asal.trim() : null,
    luas:
      input.luas === "" || input.luas === undefined || input.luas === null
        ? "0.00"
        : String(input.luas),
    lokasi: input.lokasi?.trim() ? input.lokasi.trim() : null,
    status: input.status?.trim() ? input.status.trim() : null,
    nilai:
      input.nilai === "" || input.nilai === undefined || input.nilai === null
        ? "0.00"
        : String(input.nilai),
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  if (id) {
    await updateBumindesTanahKas(villageId, id, values);
    return { id };
  }
  const baru = await insertBumindesTanahKas(villageId, values);
  return { id: baru };
}

export async function hapusTanahKasData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesTanahKas(villageId, id);
}

export async function simpanMutasiTanahKasData(input: TanahKasMutasiInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const persil = await getBumindesTanahKas(villageId, input.tanahKasId);
  if (!persil) throw notFound("Persil tanah kas tidak ditemukan.");
  const values = {
    tanahKasId: input.tanahKasId,
    tanggal: input.tanggal as string,
    jenis: input.jenis.trim(),
    uraian: input.uraian.trim(),
    luasPerubahan:
      input.luasPerubahan === "" ||
      input.luasPerubahan === undefined ||
      input.luasPerubahan === null
        ? null
        : String(input.luasPerubahan),
    nilaiPerubahan:
      input.nilaiPerubahan === "" ||
      input.nilaiPerubahan === undefined ||
      input.nilaiPerubahan === null
        ? null
        : String(input.nilaiPerubahan),
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  const baru = await insertBumindesTanahKasMutasi(villageId, values);
  return { id: baru };
}

export async function hapusMutasiTanahKasData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesTanahKasMutasi(villageId, id);
}

export async function getBukuTanahKasCetakData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesTanahKas(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    nomorPersil: item.nomorPersil,
    asal: item.asal,
    luas: item.luas,
    lokasi: item.lokasi,
    status: item.status,
    nilai: item.nilai,
    keterangan: item.keterangan,
  }));
  return { desa, tabel: tabelTanahKas("E1", "BUKU TANAH KAS DESA", baris) };
}

export async function exportBukuTanahKasCsvData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesTanahKas(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    nomorPersil: item.nomorPersil,
    asal: item.asal,
    luas: item.luas,
    lokasi: item.lokasi,
    status: item.status,
    nilai: item.nilai,
    keterangan: item.keterangan,
  }));
  const tabel = tabelTanahKas("E1", "BUKU TANAH KAS DESA", baris);
  return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku("E1", desa?.namaDesa ?? null) };
}

export async function getBukuMutasiTanahKasCetakData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [mutasi, desa, persilList] = await Promise.all([
    listBumindesTanahKasMutasi(villageId),
    getIdentitasByVillage(villageId),
    listBumindesTanahKas(villageId),
  ]);
  const map = new Map(persilList.map((p) => [p.id, p.nomorPersil]));
  const baris = mutasi.map((m, idx) => ({
    nomorUrut: idx + 1,
    tanggal: m.tanggal,
    jenis: m.jenis,
    uraian: `${map.get(m.tanahKasId) ? `[Persil ${map.get(m.tanahKasId)}] ` : ""}${m.uraian}`,
    luasPerubahan: m.luasPerubahan,
    nilaiPerubahan: m.nilaiPerubahan,
    keterangan: m.keterangan,
  }));
  return { desa, tabel: tabelMutasiTanahKas("E1", "BUKU TANAH KAS DESA (MUTASI)", baris) };
}

export async function exportBukuMutasiTanahKasCsvData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [mutasi, desa, persilList] = await Promise.all([
    listBumindesTanahKasMutasi(villageId),
    getIdentitasByVillage(villageId),
    listBumindesTanahKas(villageId),
  ]);
  const map = new Map(persilList.map((p) => [p.id, p.nomorPersil]));
  const baris = mutasi.map((m, idx) => ({
    nomorUrut: idx + 1,
    tanggal: m.tanggal,
    jenis: m.jenis,
    uraian: `${map.get(m.tanahKasId) ? `[Persil ${map.get(m.tanahKasId)}] ` : ""}${m.uraian}`,
    luasPerubahan: m.luasPerubahan,
    nilaiPerubahan: m.nilaiPerubahan,
    keterangan: m.keterangan,
  }));
  const tabel = tabelMutasiTanahKas("E1", "BUKU TANAH KAS DESA (MUTASI)", baris);
  return {
    csv: bukuResmiCsv(tabel),
    filename: namaBerkasBuku("E1-MUTASI", desa?.namaDesa ?? null),
  };
}

export async function getDaftarPembangunanData(tahun?: number) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [pembangunan, kader] = await Promise.all([
    listBumindesPembangunan(villageId, tahun),
    listBumindesKader(villageId),
  ]);
  return { pembangunan, kader };
}

export async function simpanPembangunanData(id: number | null, input: PembangunanInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const values = {
    tahun: Number(input.tahun),
    namaKegiatan: input.namaKegiatan.trim(),
    lokasi: input.lokasi?.trim() ? input.lokasi.trim() : null,
    volume: input.volume?.trim() ? input.volume.trim() : null,
    sumberDana: input.sumberDana?.trim() ? input.sumberDana.trim() : null,
    biaya:
      input.biaya === "" || input.biaya === undefined || input.biaya === null
        ? "0.00"
        : String(input.biaya),
    pelaksana: input.pelaksana?.trim() ? input.pelaksana.trim() : null,
    status: input.status || "rencana",
    tanggalMulai: input.tanggalMulai || null,
    tanggalSelesai: input.tanggalSelesai || null,
    hasil: input.hasil?.trim() ? input.hasil.trim() : null,
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  if (id) {
    await updateBumindesPembangunan(villageId, id, values);
    return { id };
  }
  const baru = await insertBumindesPembangunan(villageId, values);
  return { id: baru };
}

export async function hapusPembangunanData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesPembangunan(villageId, id);
}

export async function simpanKaderData(id: number | null, input: KaderInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const values = {
    nama: input.nama.trim(),
    jabatan: input.jabatan?.trim() ? input.jabatan.trim() : null,
    bidang: input.bidang?.trim() ? input.bidang.trim() : null,
    alamat: input.alamat?.trim() ? input.alamat.trim() : null,
    noHp: input.noHp?.trim() ? input.noHp.trim() : null,
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  if (id) {
    await updateBumindesKader(villageId, id, values);
    return { id };
  }
  const baru = await insertBumindesKader(villageId, values);
  return { id: baru };
}

export async function hapusKaderData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesKader(villageId, id);
}

export async function getBukuPembangunanCetakData(tahun?: number) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesPembangunan(villageId, tahun),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    tahun: item.tahun,
    namaKegiatan: item.namaKegiatan,
    lokasi: item.lokasi,
    volume: item.volume,
    sumberDana: item.sumberDana,
    biaya: item.biaya,
    pelaksana: item.pelaksana,
    status: item.status,
    tanggalMulai: item.tanggalMulai,
    tanggalSelesai: item.tanggalSelesai,
    hasil: item.hasil,
    keterangan: item.keterangan,
  }));
  return {
    desa,
    tabel: tabelPembangunan("P1", "BUKU PEMBANGUNAN", baris),
    subjudul: tahun ? `TAHUN ${tahun}` : undefined,
  };
}

export async function exportBukuPembangunanCsvData(tahun?: number) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesPembangunan(villageId, tahun),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    tahun: item.tahun,
    namaKegiatan: item.namaKegiatan,
    lokasi: item.lokasi,
    volume: item.volume,
    sumberDana: item.sumberDana,
    biaya: item.biaya,
    pelaksana: item.pelaksana,
    status: item.status,
    tanggalMulai: item.tanggalMulai,
    tanggalSelesai: item.tanggalSelesai,
    hasil: item.hasil,
    keterangan: item.keterangan,
  }));
  const tabel = tabelPembangunan("P1", "BUKU PEMBANGUNAN", baris);
  return {
    csv: bukuResmiCsv(tabel),
    filename: namaBerkasBuku(tahun ? `P1-${tahun}` : "P1", desa?.namaDesa ?? null),
  };
}

export async function getBukuKaderCetakData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesKader(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    nama: item.nama,
    jabatan: item.jabatan,
    bidang: item.bidang,
    alamat: item.alamat,
    noHp: item.noHp,
    keterangan: item.keterangan,
  }));
  return { desa, tabel: tabelKader("K1", "BUKU KADER PEMBANGUNAN", baris) };
}

export async function exportBukuKaderCsvData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesKader(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    nama: item.nama,
    jabatan: item.jabatan,
    bidang: item.bidang,
    alamat: item.alamat,
    noHp: item.noHp,
    keterangan: item.keterangan,
  }));
  const tabel = tabelKader("K1", "BUKU KADER PEMBANGUNAN", baris);
  return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku("K1", desa?.namaDesa ?? null) };
}

export async function getDaftarSekretariatData(jenis?: string) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [peraturan, aparat, agenda] = await Promise.all([
    listBumindesPeraturan(villageId),
    listBumindesAparat(villageId),
    listBumindesAgenda(villageId, jenis),
  ]);
  return { peraturan, aparat, agenda };
}

export async function simpanPeraturanData(id: number | null, input: PeraturanInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const values = {
    jenis: input.jenis || "peraturan_desa",
    nomor: input.nomor.trim(),
    tahun:
      input.tahun === "" || input.tahun === undefined || input.tahun === null
        ? null
        : Number(input.tahun),
    tentang: input.tentang.trim(),
    tanggalDitetapkan: input.tanggalDitetapkan || null,
    tanggalDiundangkan: input.tanggalDiundangkan || null,
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  if (id) {
    await updateBumindesPeraturan(villageId, id, values);
    return { id };
  }
  const baru = await insertBumindesPeraturan(villageId, values);
  return { id: baru };
}

export async function hapusPeraturanData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesPeraturan(villageId, id);
}

export async function simpanAparatData(id: number | null, input: AparatInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const values = {
    nama: input.nama.trim(),
    nip: input.nip?.trim() ? input.nip.trim() : null,
    jabatan: input.jabatan.trim(),
    tempatLahir: input.tempatLahir?.trim() ? input.tempatLahir.trim() : null,
    tanggalLahir: input.tanggalLahir || null,
    pendidikan: input.pendidikan?.trim() ? input.pendidikan.trim() : null,
    nomorSkPengangkatan: input.nomorSkPengangkatan?.trim()
      ? input.nomorSkPengangkatan.trim()
      : null,
    tanggalPengangkatan: input.tanggalPengangkatan || null,
    nomorSkPemberhentian: input.nomorSkPemberhentian?.trim()
      ? input.nomorSkPemberhentian.trim()
      : null,
    tanggalPemberhentian: input.tanggalPemberhentian || null,
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  if (id) {
    await updateBumindesAparat(villageId, id, values);
    return { id };
  }
  const baru = await insertBumindesAparat(villageId, values);
  return { id: baru };
}

export async function hapusAparatData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesAparat(villageId, id);
}

export async function simpanAgendaData(id: number | null, input: AgendaInput) {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const values = {
    jenis: input.jenis || "masuk",
    tanggal: input.tanggal as string,
    nomorSurat: input.nomorSurat?.trim() ? input.nomorSurat.trim() : null,
    asalTujuan: input.asalTujuan?.trim() ? input.asalTujuan.trim() : null,
    perihal: input.perihal.trim(),
    keterangan: input.keterangan?.trim() ? input.keterangan.trim() : null,
  };
  if (id) {
    await updateBumindesAgenda(villageId, id, values);
    return { id };
  }
  const baru = await insertBumindesAgenda(villageId, values);
  return { id: baru };
}

export async function hapusAgendaData(id: number) {
  const user = await requirePermission(RESOURCES.bumindes, "delete");
  const villageId = await resolveVillageId(user);
  await deleteBumindesAgenda(villageId, id);
}

export async function getBukuPeraturanCetakData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesPeraturan(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    jenis: item.jenis === "keputusan_kades" ? "Keputusan Kades" : "Peraturan Desa",
    nomor: item.nomor,
    tahun: item.tahun,
    tentang: item.tentang,
    tanggalDitetapkan: item.tanggalDitetapkan,
    tanggalDiundangkan: item.tanggalDiundangkan,
    keterangan: item.keterangan,
  }));
  return {
    desa,
    tabel: tabelPeraturan("A1", "BUKU PERATURAN DESA DAN KEPUTUSAN KEPALA DESA", baris),
  };
}

export async function exportBukuPeraturanCsvData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesPeraturan(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    jenis: item.jenis === "keputusan_kades" ? "Keputusan Kades" : "Peraturan Desa",
    nomor: item.nomor,
    tahun: item.tahun,
    tentang: item.tentang,
    tanggalDitetapkan: item.tanggalDitetapkan,
    tanggalDiundangkan: item.tanggalDiundangkan,
    keterangan: item.keterangan,
  }));
  const tabel = tabelPeraturan("A1", "BUKU PERATURAN DESA DAN KEPUTUSAN KEPALA DESA", baris);
  return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku("A1", desa?.namaDesa ?? null) };
}

export async function getBukuAparatCetakData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesAparat(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    nama: item.nama,
    nip: item.nip,
    jabatan: item.jabatan,
    tempatLahir: item.tempatLahir,
    tanggalLahir: item.tanggalLahir,
    pendidikan: item.pendidikan,
    nomorSkPengangkatan: item.nomorSkPengangkatan,
    tanggalPengangkatan: item.tanggalPengangkatan,
    nomorSkPemberhentian: item.nomorSkPemberhentian,
    tanggalPemberhentian: item.tanggalPemberhentian,
    keterangan: item.keterangan,
  }));
  return { desa, tabel: tabelAparat("A4", "BUKU APARAT PEMERINTAH DESA", baris) };
}

export async function exportBukuAparatCsvData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesAparat(villageId),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    nama: item.nama,
    nip: item.nip,
    jabatan: item.jabatan,
    tempatLahir: item.tempatLahir,
    tanggalLahir: item.tanggalLahir,
    pendidikan: item.pendidikan,
    nomorSkPengangkatan: item.nomorSkPengangkatan,
    tanggalPengangkatan: item.tanggalPengangkatan,
    nomorSkPemberhentian: item.nomorSkPemberhentian,
    tanggalPemberhentian: item.tanggalPemberhentian,
    keterangan: item.keterangan,
  }));
  const tabel = tabelAparat("A4", "BUKU APARAT PEMERINTAH DESA", baris);
  return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku("A4", desa?.namaDesa ?? null) };
}

export async function getBukuAgendaCetakData(jenis?: string) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesAgenda(villageId, jenis),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    jenis: item.jenis === "keluar" ? "Surat Keluar" : "Surat Masuk",
    tanggal: item.tanggal,
    nomorSurat: item.nomorSurat,
    asalTujuan: item.asalTujuan,
    perihal: item.perihal,
    keterangan: item.keterangan,
  }));
  const namaBuku = jenis === "keluar" ? "BUKU EKSPEDISI" : "BUKU AGENDA";
  const kode = jenis === "keluar" ? "A7" : "A6";
  return { desa, tabel: tabelAgenda(kode, namaBuku, baris) };
}

export async function exportBukuAgendaCsvData(jenis?: string) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const [items, desa] = await Promise.all([
    listBumindesAgenda(villageId, jenis),
    getIdentitasByVillage(villageId),
  ]);
  const baris = items.map((item, idx) => ({
    nomorUrut: idx + 1,
    jenis: item.jenis === "keluar" ? "Surat Keluar" : "Surat Masuk",
    tanggal: item.tanggal,
    nomorSurat: item.nomorSurat,
    asalTujuan: item.asalTujuan,
    perihal: item.perihal,
    keterangan: item.keterangan,
  }));
  const namaBuku = jenis === "keluar" ? "BUKU EKSPEDISI" : "BUKU AGENDA";
  const kode = jenis === "keluar" ? "A7" : "A6";
  const tabel = tabelAgenda(kode, namaBuku, baris);
  return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku(kode, desa?.namaDesa ?? null) };
}

export async function getBukuMutasiPendudukCetakData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  // Ambil data dari modul penduduk/mutasi jika tersedia; fallback ringkas dari items B3
  const buku = await getBumindesBuku(
    villageId,
    (await ensureBumindesBuku(villageId)).find((b) => b.kodeBuku === "B3")?.id ?? 0,
  );
  const desa = await getIdentitasByVillage(villageId);
  if (!buku) {
    return { desa, tabel: tabelMutasiPenduduk("B3", "BUKU DATA MUTASI PENDUDUK", []) };
  }
  const items = await listBumindesItem(villageId, buku.id);
  const baris = items.map((item, idx) => ({
    nomorUrut: item.nomorUrut || idx + 1,
    tanggal: item.tanggal,
    jenisMutasi: item.uraian,
    keterangan: item.keterangan,
  }));
  return { desa, tabel: tabelMutasiPenduduk("B3", "BUKU DATA MUTASI PENDUDUK", baris) };
}

export async function exportBukuMutasiPendudukCsvData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const daftar = await ensureBumindesBuku(villageId);
  const buku = daftar.find((b) => b.kodeBuku === "B3");
  const desa = await getIdentitasByVillage(villageId);
  if (!buku) {
    const tabel = tabelMutasiPenduduk("B3", "BUKU DATA MUTASI PENDUDUK", []);
    return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku("B3", desa?.namaDesa ?? null) };
  }
  const items = await listBumindesItem(villageId, buku.id);
  const baris = items.map((item, idx) => ({
    nomorUrut: item.nomorUrut || idx + 1,
    tanggal: item.tanggal,
    jenisMutasi: item.uraian,
    keterangan: item.keterangan,
  }));
  const tabel = tabelMutasiPenduduk("B3", "BUKU DATA MUTASI PENDUDUK", baris);
  return { csv: bukuResmiCsv(tabel), filename: namaBerkasBuku("B3", desa?.namaDesa ?? null) };
}
