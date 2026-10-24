"use server";

import { revalidatePath } from "next/cache";

import {
  hapusPengaduanData,
  setPublikPengaduanData,
  tanggapiPengaduanData,
} from "@/features/pengaduan/application/use-cases";
import { tanggapanFormSchema } from "@/features/pengaduan/domain/pengaduan";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH = "/pengaduan";
const PATH_PUBLIK = "/desa/pengaduan";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Simpan status/tanggapan petugas atas satu pengaduan. */
export async function tanggapiPengaduanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data pengaduan tidak valid.");

  const parsed = tanggapanFormSchema.safeParse({
    status: text(formData, "status"),
    tanggapan: text(formData, "tanggapan"),
    publik: formData.get("publik") === "on",
  });

  if (!parsed.success) {
    return errorState("Periksa kembali tanggapan.", zodToFieldErrors(parsed.error));
  }

  try {
    await tanggapiPengaduanData(id, parsed.data);
    revalidatePath(PATH);
    revalidatePath(PATH_PUBLIK);
    return successState("Tanggapan pengaduan disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Tampilkan/sembunyikan pengaduan pada halaman publik. */
export async function setPublikPengaduanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data pengaduan tidak valid.");

  const publik = formData.get("publik") === "1";

  try {
    await setPublikPengaduanData(id, publik);
    revalidatePath(PATH);
    revalidatePath(PATH_PUBLIK);
    return successState(
      publik ? "Pengaduan ditampilkan di situs publik." : "Pengaduan disembunyikan dari publik.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus pengaduan beserta lampirannya. */
export async function hapusPengaduanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data pengaduan tidak valid.");

  try {
    await hapusPengaduanData(id);
    revalidatePath(PATH);
    revalidatePath(PATH_PUBLIK);
    return successState("Pengaduan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
