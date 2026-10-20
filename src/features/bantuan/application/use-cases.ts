import "server-only";

import {
  BANTUAN_PESERTA_RESOURCE,
  BANTUAN_RESOURCE,
  buildProgramSlug,
  SASARAN_KELUARGA,
  SASARAN_PENDUDUK,
  SASARAN_RUMAH_TANGGA,
  type BantuanDetail,
  type BantuanDTO,
  type BantuanFormInput,
  type PesertaBantuanRow,
  type PesertaFormInput,
  type PesertaReferenceData,
  type SasaranOption,
} from "@/features/bantuan/domain/bantuan";
import {
  bantuanSlugExists,
  countPesertaByProgram,
  deleteBantuan as deleteBantuanRow,
  deletePeserta as deletePesertaRow,
  findAlamatSasaran,
  findBantuanById,
  findPendudukSasaran,
  insertBantuan,
  insertPeserta,
  listBantuan as listBantuanRows,
  listKeluargaSasaran,
  listPendudukSasaran,
  listPesertaProgram,
  listRumahTanggaSasaran,
  listSebaranWilayah,
  updateBantuan as updateBantuanRow,
  type BantuanListResult,
} from "@/features/bantuan/infrastructure/bantuan-repository";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { formatWilayahLabel } from "@/features/wilayah/domain/wilayah";
import { requirePermission, requireUser } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

/**
 * Lapisan aplikasi (use case) untuk bantuan sosial.
 *
 * Setiap use case menegakkan izinnya sendiri lewat `requirePermission`, sehingga
 * pemanggil mana pun (Server Action, Route Handler, skrip) ikut terlindungi.
 * Aturan yang bersifat lintas-data — slug unik, larangan menghapus program yang
 * masih berpeserta, dan kesesuaian sasaran dengan kandidat — ditegakkan di sini.
 */

export interface ListBantuanParams {
  search: string;
  page: number;
  pageSize: number;
}

export async function listBantuan(params: ListBantuanParams): Promise<BantuanListResult> {
  const user = await requirePermission(BANTUAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  return listBantuanRows({ villageId, ...params });
}

/**
 * Slug program yang bebas.
 *
 * Slug dibentuk dari nama, lalu diberi akhiran angka bila sudah dipakai program
 * lain di desa yang sama. Indeks unik `(village_id, slug)` tetap menjadi
 * pengaman terakhir.
 */
async function slugBebas(
  villageId: number,
  nama: string,
  excludeId: number | null,
): Promise<string> {
  const dasar = buildProgramSlug(nama);

  for (let langkah = 0; langkah < 200; langkah += 1) {
    const kandidat = langkah === 0 ? dasar : `${dasar}-${langkah + 1}`;
    if (!(await bantuanSlugExists(villageId, kandidat, excludeId))) {
      return kandidat;
    }
  }

  throw conflict("Tidak dapat membentuk slug program yang unik.");
}

/** Program yang berada di desa pengguna, atau gagal bila tidak ada. */
async function getScopedProgram(villageId: number, id: number): Promise<BantuanDTO> {
  const program = await findBantuanById(villageId, id);
  if (!program) throw notFound("Program bantuan tidak ditemukan.");
  return program;
}

export async function createBantuan(input: BantuanFormInput): Promise<{ id: number }> {
  const user = await requirePermission(BANTUAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const slug = await slugBebas(villageId, input.nama, null);
  const id = await insertBantuan(villageId, slug, input);
  return { id };
}

export async function updateBantuan(id: number, input: BantuanFormInput): Promise<void> {
  const user = await requirePermission(BANTUAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await getScopedProgram(villageId, id);

  const slug = await slugBebas(villageId, input.nama, id);
  await updateBantuanRow(id, slug, input);
}

/**
 * Hapus program.
 *
 * Program yang masih punya peserta **tidak boleh** dihapus agar riwayat
 * penerimaan tidak hilang tanpa jejak; kosongkan pesertanya terlebih dahulu.
 */
export async function deleteBantuan(id: number): Promise<void> {
  const user = await requirePermission(BANTUAN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  await getScopedProgram(villageId, id);

  const peserta = await countPesertaByProgram(villageId, id);
  if (peserta > 0) {
    throw conflict(
      `Program tidak dapat dihapus karena masih memiliki ${peserta} peserta. Kosongkan peserta terlebih dahulu.`,
    );
  }

  await deleteBantuanRow(id);
}

/**
 * Data pendukung halaman rincian program.
 *
 * Kandidat sasaran hanya dimuat bila pengguna berhak mengubah data — sekaligus
 * menghemat dua query untuk pengguna baca-saja.
 */
export async function getBantuanDetail(programId: number): Promise<BantuanDetail> {
  const user = await requirePermission(BANTUAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const program = await getScopedProgram(villageId, programId);
  const canManage = await punyaIzinUbah();

  const [peserta, sebaran, reference] = await Promise.all([
    listPesertaProgram(villageId, program),
    listSebaranWilayah(villageId, program),
    canManage ? getReferenceKandidat(villageId, program) : Promise.resolve(emptyReference()),
  ]);

  return { program, peserta, reference, sebaranWilayah: sebaran, canManage };
}

/** Apakah pengguna berhak mengubah data peserta. */
async function punyaIzinUbah(): Promise<boolean> {
  const user = await requireUser();
  return (
    hasPermission(user.permissions, BANTUAN_PESERTA_RESOURCE, "update") &&
    hasPermission(user.permissions, BANTUAN_RESOURCE, "update")
  );
}

function emptyReference(): PesertaReferenceData {
  return { penduduk: [], keluarga: [], rumahTangga: [] };
}

/** Kandidat sasaran yang belum menjadi peserta program. */
async function getReferenceKandidat(
  villageId: number,
  program: BantuanDTO,
): Promise<PesertaReferenceData> {
  const reference = emptyReference();

  if (program.sasaran === SASARAN_KELUARGA) {
    reference.keluarga = await listKeluargaSasaran(villageId, program.id);
  } else if (program.sasaran === SASARAN_RUMAH_TANGGA) {
    reference.rumahTangga = await listRumahTanggaSasaran(villageId, program.id);
  } else if (program.sasaran === SASARAN_PENDUDUK) {
    reference.penduduk = await listPendudukSasaran(villageId, program.id);
  }

  return reference;
}

/** Peserta sebuah program (dimuat ulang oleh UI setelah perubahan). */
export async function listPesertaBantuan(programId: number): Promise<PesertaBantuanRow[]> {
  const user = await requirePermission(BANTUAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const program = await getScopedProgram(villageId, programId);
  return listPesertaProgram(villageId, program);
}

/** Kandidat sasaran terbaru untuk program (dipakai setelah peserta ditambah). */
export async function getPesertaReference(programId: number): Promise<PesertaReferenceData> {
  const user = await requirePermission(BANTUAN_PESERTA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const program = await getScopedProgram(villageId, programId);
  return getReferenceKandidat(villageId, program);
}

/**
 * Tambahkan seorang peserta ke program.
 *
 * Sasaran yang dipilih divalidasi terhadap **kandidat yang tersedia** untuk
 * program tersebut, sehingga tidak mungkin menautkan sasaran desa lain atau
 * sasaran yang sudah menjadi peserta. Data kartu yang dibiarkan kosong diisi
 * dari data master sebagai nilai awal.
 */
export async function addPeserta(
  programId: number,
  input: PesertaFormInput,
): Promise<{ id: number }> {
  const user = await requirePermission(BANTUAN_PESERTA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const program = await getScopedProgram(villageId, programId);

  if (input.programId !== null && input.programId !== programId) {
    throw validationError("Program peserta tidak sesuai.");
  }

  const sasaranId = input.sasaranId;
  if (sasaranId === null) {
    throw validationError("Pilih sasaran peserta terlebih dahulu.", {
      sasaranId: ["Pilih sasaran peserta terlebih dahulu."],
    });
  }

  const reference = await getReferenceKandidat(villageId, program);
  const kandidat = pilihKandidat(reference, program.sasaran);
  if (!kandidat.some((option) => option.id === sasaranId)) {
    throw validationError("Sasaran yang dipilih tidak tersedia untuk program ini.", {
      sasaranId: ["Sasaran yang dipilih tidak tersedia untuk program ini."],
    });
  }

  const lengkap = await lengkapiKartu(villageId, program.sasaran, sasaranId, input);
  await insertPeserta(villageId, programId, program.sasaran, sasaranId, lengkap);

  return { id: sasaranId };
}

function pilihKandidat(reference: PesertaReferenceData, sasaran: number): SasaranOption[] {
  if (sasaran === SASARAN_KELUARGA) return reference.keluarga;
  if (sasaran === SASARAN_RUMAH_TANGGA) return reference.rumahTangga;
  return reference.penduduk;
}

/**
 * Isi snapshot kartu dari data master bila pengguna mengosongkannya.
 *
 * Untuk sasaran penduduk, NIK/nama/tempat/tanggal lahir/alamat diambil dari
 * baris penduduk. Untuk keluarga & rumah tangga hanya alamat yang tersedia di
 * master, sisanya dibiarkan kosong agar tidak salah mengisi identitas orang.
 */
async function lengkapiKartu(
  villageId: number,
  sasaran: number,
  sasaranId: number,
  input: PesertaFormInput,
): Promise<PesertaFormInput> {
  const lengkap: PesertaFormInput = { ...input };

  if (sasaran === SASARAN_PENDUDUK) {
    const penduduk = await findPendudukSasaran(villageId, sasaranId);
    if (penduduk) {
      lengkap.kartuNik ??= penduduk.nationalId;
      lengkap.kartuNama ||= penduduk.name;
      lengkap.kartuTempatLahir ||= penduduk.birthPlace ?? "";
      lengkap.kartuTanggalLahir ??= penduduk.birthDate;
      if (!lengkap.kartuAlamat) {
        lengkap.kartuAlamat = penduduk.address || wilayahLabel(penduduk);
      }
    }
  } else if (sasaran === SASARAN_KELUARGA || sasaran === SASARAN_RUMAH_TANGGA) {
    if (!lengkap.kartuAlamat) {
      const alamat = await findAlamatSasaran(
        villageId,
        sasaran === SASARAN_KELUARGA ? "keluarga" : "rumah-tangga",
        sasaranId,
      );
      if (alamat) lengkap.kartuAlamat = alamat;
    }
  }

  return lengkap;
}

/** Label wilayah penduduk, atau string kosong bila wilayahnya belum diisi. */
function wilayahLabel(wilayah: {
  dusun: string | null;
  rw: string | null;
  rt: string | null;
}): string {
  if (!wilayah.dusun && !wilayah.rw && !wilayah.rt) return "";
  return formatWilayahLabel({
    dusun: wilayah.dusun ?? "",
    rw: wilayah.rw ?? "",
    rt: wilayah.rt ?? "",
  });
}

/** Keluarkan seorang peserta dari program. */
export async function removePeserta(programId: number, pesertaId: number): Promise<void> {
  const user = await requirePermission(BANTUAN_PESERTA_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  await getScopedProgram(villageId, programId);
  await deletePesertaRow(villageId, programId, pesertaId);
}
