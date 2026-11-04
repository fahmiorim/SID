"use server";

import { revalidatePath } from "next/cache";

import {
  deleteLaporanKeuanganDokumen,
  imporDokumenLaporan,
  saveLaporanKeuanganDokumen,
  setLaporanKeuanganDiserahkan,
  type ImporDokumenBerkasInput,
} from "@/features/keuangan/application/laporan-dokumen-use-cases";
import { MAKS_UKURAN_BERKAS, tanggalPenyerahan } from "@/features/keuangan/domain/laporan-dokumen";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

const LAPORAN_PATH = "/keuangan/laporan-dokumen";

function bacaId(formData: FormData): number | null {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Simpan dokumen laporan (unggah baru atau ganti).
 *
 * Berkas dibaca menjadi `Uint8Array` di sini karena use-case tidak boleh
 * menyentuh `FormData`; validasi tipe/ukuran tetap dilakukan di domain.
 */
export async function saveLaporanDokumenAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const metadata = {
    tipe: formData.get("tipe"),
    judul: formData.get("judul"),
    tahun: formData.get("tahun"),
    semester: formData.get("semester"),
  };

  const berkasRaw = formData.get("berkas");
  const berkas =
    berkasRaw instanceof File && berkasRaw.size > 0
      ? {
          nama: berkasRaw.name,
          tipe: berkasRaw.type,
          isi: new Uint8Array(await berkasRaw.arrayBuffer()),
        }
      : null;

  if (berkas && berkas.isi.byteLength > MAKS_UKURAN_BERKAS) {
    return errorState("Ukuran berkas maksimal 8 MB.");
  }

  const id = bacaId(formData) ?? undefined;

  try {
    await saveLaporanKeuanganDokumen({ metadata, berkas, id });
    revalidatePath(LAPORAN_PATH);
    return successState(id ? "Dokumen laporan diperbarui." : "Dokumen laporan disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/**
 * Impor banyak dokumen laporan sekaligus.
 *
 * Berkas dikirim sebagai beberapa entri `berkas`; metadata tiap berkas memakai
 * sufiks indeks (`judul-0`, `jenis-0`, `tahun-0`, `semester-0`, dst.) sesuai
 * urutan berkas pada FormData. Isi berkas dibaca menjadi `Uint8Array` di sini
 * agar use-case tidak menyentuh `File`.
 */
export async function imporDokumenLaporanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const files = formData
    .getAll("berkas")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return errorState("Pilih minimal satu berkas PDF untuk diimpor.");
  }

  const berkas: ImporDokumenBerkasInput[] = [];
  for (const [index, file] of files.entries()) {
    if (file.size > MAKS_UKURAN_BERKAS) {
      return errorState(`Berkas ${file.name} melebihi batas 8 MB.`);
    }
    berkas.push({
      nama: file.name,
      mime: file.type,
      isi: new Uint8Array(await file.arrayBuffer()),
      judul: String(formData.get(`judul-${index}`) ?? ""),
      jenis: String(formData.get(`jenis-${index}`) ?? ""),
      tahun: Number(formData.get(`tahun-${index}`) ?? Number.NaN),
      semester: Number(formData.get(`semester-${index}`) ?? Number.NaN),
    });
  }

  try {
    const { berhasil } = await imporDokumenLaporan({ berkas });
    revalidatePath(LAPORAN_PATH);
    return successState(`${berhasil} dokumen laporan berhasil diimpor.`);
  } catch (error) {
    return toErrorState(error);
  }
}

/** Catat tanggal penyerahan dokumen laporan (kirim `""` untuk mengosongkan). */
export async function setLaporanDiserahkanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = bacaId(formData);
  if (id === null) return errorState("Dokumen laporan tidak valid.");

  const raw = formData.get("diserahkanPada");
  const isi = typeof raw === "string" ? raw : "";
  if (isi.trim() !== "" && tanggalPenyerahan(isi) === null) {
    return errorState("Tanggal penyerahan tidak valid.");
  }

  const tanggal = tanggalPenyerahan(isi);

  try {
    await setLaporanKeuanganDiserahkan(id, tanggal);
    revalidatePath(LAPORAN_PATH);
    return successState(
      tanggal ? "Tanggal penyerahan dicatat." : "Tanggal penyerahan dikosongkan.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteLaporanDokumenAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = bacaId(formData);
  if (id === null) return errorState("Dokumen laporan tidak valid.");

  try {
    await deleteLaporanKeuanganDokumen(id);
    revalidatePath(LAPORAN_PATH);
    return successState("Dokumen laporan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
