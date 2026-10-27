"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  hapusLampiranDtksUseCase,
  hapusProgramDtksUseCase,
  imporDtksUseCase,
  lepasLampiranUseCase,
  simpanProgramDtksUseCase,
  tautkanLampiranUseCase,
  unggahLampiranDtksUseCase,
} from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE } from "@/features/penduduk/domain/dtks";
import {
  KOLOM_IMPOR_DTKS,
  type BarisImporDtks,
  type KunciImporDtks,
} from "@/features/penduduk/domain/dtks-berkas";
import { simpanUnggahanMedia } from "@/features/publik/infrastructure/media-storage";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";
import { bacaImporDariFormData } from "@/lib/impor-berkas";

const DTKS_PATH = "/penduduk/dtks";

/** Nilai teks dari FormData. */
function text(formData: FormData, nama: string): string {
  const nilai = formData.get(nama);
  return typeof nilai === "string" ? nilai.trim() : "";
}

/**
 * Impor DTKS dari berkas CSV/XLSX.
 *
 * Membaca berkas lewat helper bersama (`bacaImporDariFormData`) sehingga
 * validasi ekstensi, ukuran, dan pemetaan header konsisten di seluruh modul.
 */
export async function imporDtksAction(formData: FormData): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin untuk mengimpor DTKS." };
  }

  const hasil = await bacaImporDariFormData<KunciImporDtks>(
    formData.get("berkas"),
    KOLOM_IMPOR_DTKS,
  );

  if (!hasil.ok) {
    return { ok: false, message: hasil.pesan };
  }

  if (hasil.hasil.baris.length === 0) {
    const pesan = hasil.hasil.galat[0]?.pesan ?? "Tidak ada baris data pada berkas.";
    return { ok: false, message: pesan };
  }

  const villageId = await resolveVillageId(user);
  const rows: BarisImporDtks[] = hasil.hasil.baris.map((baris) => ({
    noRtm: baris.nilai.noRtm,
    namaResponden: baris.nilai.namaResponden,
    namaPetugas: baris.nilai.namaPetugas,
    tanggalPencacahan: baris.nilai.tanggalPencacahan,
  }));

  try {
    const ringkasan = await imporDtksUseCase(villageId, rows);
    revalidatePath(DTKS_PATH);

    const bagian = [`${ringkasan.dibuat} formulir dibuat`, `${ringkasan.dilewati} dilewati`];
    if (ringkasan.tidakDitemukan.length > 0) {
      bagian.push(
        `${ringkasan.tidakDitemukan.length} nomor RTM tidak ditemukan (${ringkasan.tidakDitemukan
          .slice(0, 5)
          .join(", ")}${ringkasan.tidakDitemukan.length > 5 ? ", …" : ""})`,
      );
    }

    return { ok: true, message: `Impor selesai: ${bagian.join("; ")}.` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Impor DTKS gagal.",
    };
  }
}

/** Unggah lampiran DTKS (berkas media privat per desa). */
export async function unggahLampiranDtksAction(formData: FormData): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin mengunggah lampiran." };
  }

  const berkas = formData.get("berkas");
  const nama = text(formData, "nama");
  const keterangan = text(formData, "keterangan");

  if (nama === "") {
    return { ok: false, message: "Nama lampiran wajib diisi." };
  }
  if (!(berkas instanceof File) || berkas.size === 0) {
    return { ok: false, message: "Pilih berkas yang akan diunggah." };
  }

  const villageId = await resolveVillageId(user);

  try {
    const simpan = await simpanUnggahanMedia(villageId, "umum", {
      nama: berkas.name,
      mime: berkas.type || null,
      ukuran: berkas.size,
      isi: new Uint8Array(await berkas.arrayBuffer()),
    });

    await unggahLampiranDtksUseCase({
      villageId,
      nama,
      berkas: simpan.jalur,
      keterangan: keterangan === "" ? null : keterangan,
    });

    revalidatePath(`${DTKS_PATH}/lampiran`);
    return { ok: true, message: "Lampiran diunggah." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal mengunggah lampiran.",
    };
  }
}

export async function hapusLampiranDtksAction(id: number): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin menghapus lampiran." };
  }

  const villageId = await resolveVillageId(user);

  try {
    await hapusLampiranDtksUseCase(villageId, id);
    revalidatePath(`${DTKS_PATH}/lampiran`);
    return { ok: true, message: "Lampiran dihapus." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menghapus lampiran.",
    };
  }
}

export async function tautkanLampiranAction(
  dtksId: number,
  lampiranId: number,
): Promise<{ ok: boolean; message: string }> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }

  const villageId = await resolveVillageId(user);

  try {
    await tautkanLampiranUseCase(villageId, dtksId, lampiranId);
    revalidatePath(DTKS_PATH);
    return { ok: true, message: "Lampiran ditautkan." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menautkan." };
  }
}

export async function lepasLampiranAction(
  dtksId: number,
  lampiranId: number,
): Promise<{ ok: boolean; message: string }> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }

  const villageId = await resolveVillageId(user);

  try {
    await lepasLampiranUseCase(villageId, dtksId, lampiranId);
    revalidatePath(DTKS_PATH);
    return { ok: true, message: "Lampiran dilepas." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal melepas." };
  }
}

/** Simpan (tambah/ubah) program bansos DTKS. */
export async function simpanProgramDtksAction(formData: FormData): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin menyimpan program." };
  }

  const kodeProgram = text(formData, "kodeProgram").toUpperCase();
  const namaProgram = text(formData, "namaProgram");
  const aktif = text(formData, "aktif") !== "0";

  if (kodeProgram === "" || namaProgram === "") {
    return { ok: false, message: "Kode dan nama program wajib diisi." };
  }
  if (kodeProgram.length > 50 || namaProgram.length > 200) {
    return { ok: false, message: "Kode/nama program terlalu panjang." };
  }

  const villageId = await resolveVillageId(user);

  try {
    await simpanProgramDtksUseCase({ villageId, kodeProgram, namaProgram, aktif });
    revalidatePath(`${DTKS_PATH}/pengaturan`);
    return { ok: true, message: "Program disimpan." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan program.",
    };
  }
}

export async function hapusProgramDtksAction(id: number): Promise<{
  ok: boolean;
  message: string;
}> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, DTKS_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin menghapus program." };
  }

  const villageId = await resolveVillageId(user);

  try {
    await hapusProgramDtksUseCase(villageId, id);
    revalidatePath(`${DTKS_PATH}/pengaturan`);
    return { ok: true, message: "Program dihapus." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menghapus program.",
    };
  }
}
