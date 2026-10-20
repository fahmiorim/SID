"use server";

import { revalidatePath } from "next/cache";

import {
  deleteLaporanKeuanganDokumen,
  saveLaporanKeuanganDokumen,
  setLaporanKeuanganTerkirim,
} from "@/features/keuangan/application/laporan-dokumen-use-cases";
import { MAKS_UKURAN_BERKAS } from "@/features/keuangan/domain/laporan-dokumen";
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

export async function setLaporanTerkirimAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = bacaId(formData);
  if (id === null) return errorState("Dokumen laporan tidak valid.");

  const terkirim = formData.get("terkirim") === "true";

  try {
    await setLaporanKeuanganTerkirim(id, terkirim);
    revalidatePath(LAPORAN_PATH);
    return successState(terkirim ? "Laporan ditandai terkirim." : "Penandaan kirim dibatalkan.");
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
