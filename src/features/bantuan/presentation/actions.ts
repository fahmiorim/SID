"use server";

import { revalidatePath } from "next/cache";

import {
  addPeserta,
  createBantuan,
  deleteBantuan,
  getPesertaReference,
  listPesertaBantuan,
  removePeserta,
  updateBantuan,
} from "@/features/bantuan/application/use-cases";
import {
  bantuanFormSchema,
  pesertaFormSchema,
  type PesertaBantuanRow,
  type PesertaReferenceData,
} from "@/features/bantuan/domain/bantuan";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const BANTUAN_PATH = "/bantuan";

/** Ambil nilai teks dari FormData (string kosong bila tidak ada). */
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/**
 * Simpan program bantuan (tambah bila `id` kosong, ubah bila ada).
 *
 * Slug tidak diambil dari formulir — dibentuk dari nama di use case. Izin &
 * validasi ditegakkan di server; UI hanya menyajikan.
 */
export async function saveBantuanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = bantuanFormSchema.safeParse({
    nama: text(formData, "nama"),
    sasaran: text(formData, "sasaran"),
    keterangan: text(formData, "keterangan"),
    tanggalMulai: text(formData, "tanggalMulai"),
    tanggalAkhir: text(formData, "tanggalAkhir"),
    asalDana: text(formData, "asalDana"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createBantuan(parsed.data);
    } else {
      await updateBantuan(id, parsed.data);
    }

    revalidatePath(BANTUAN_PATH);
    return successState(
      id === null ? "Program bantuan ditambahkan." : "Program bantuan diperbarui.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus program bantuan berdasarkan `id`. */
export async function deleteBantuanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data program bantuan tidak valid.");
  }

  try {
    await deleteBantuan(id);
    revalidatePath(BANTUAN_PATH);
    return successState("Program bantuan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Tambahkan peserta ke program. */
export async function addPesertaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const programId = parseId(formData.get("programId"));

  if (programId === null) {
    return errorState("Data program bantuan tidak valid.");
  }

  const parsed = pesertaFormSchema.safeParse({
    programId: text(formData, "programId"),
    sasaranId: text(formData, "sasaranId"),
    nomorKartu: text(formData, "nomorKartu"),
    kartuNik: text(formData, "kartuNik"),
    kartuNama: text(formData, "kartuNama"),
    kartuTempatLahir: text(formData, "kartuTempatLahir"),
    kartuTanggalLahir: text(formData, "kartuTanggalLahir"),
    kartuAlamat: text(formData, "kartuAlamat"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    await addPeserta(programId, parsed.data);
    revalidatePath(BANTUAN_PATH);
    return successState("Peserta ditambahkan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Keluarkan peserta dari program. */
export async function removePesertaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const programId = parseId(formData.get("programId"));
  const pesertaId = parseId(formData.get("pesertaId"));

  if (programId === null || pesertaId === null) {
    return errorState("Data peserta tidak valid.");
  }

  try {
    await removePeserta(programId, pesertaId);
    revalidatePath(BANTUAN_PATH);
    return successState("Peserta dikeluarkan dari program.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hasil muat ulang daftar peserta untuk dialog rincian. */
export type PesertaLoadResult =
  | { ok: true; peserta: PesertaBantuanRow[]; reference: PesertaReferenceData }
  | { ok: false; message: string };

export async function loadPesertaAction(programId: number): Promise<PesertaLoadResult> {
  if (!Number.isInteger(programId) || programId <= 0) {
    return { ok: false, message: "Data program bantuan tidak valid." };
  }

  try {
    const [peserta, reference] = await Promise.all([
      listPesertaBantuan(programId),
      getPesertaReference(programId),
    ]);

    return { ok: true, peserta, reference };
  } catch (error) {
    const state = toErrorState(error);
    return { ok: false, message: state.status === "error" ? state.message : "Gagal memuat data." };
  }
}
