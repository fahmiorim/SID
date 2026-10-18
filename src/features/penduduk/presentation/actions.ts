"use server";

import { revalidatePath } from "next/cache";

import {
  createPenduduk,
  deletePenduduk,
  updatePenduduk,
} from "@/features/penduduk/application/use-cases";
import { pendudukFormSchema } from "@/features/penduduk/domain/penduduk";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PENDUDUK_PATH = "/penduduk";

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Ambil nilai teks dari FormData (string kosong bila tidak ada). */
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Simpan penduduk (tambah bila `id` kosong, ubah bila ada).
 *
 * Izin & validasi ditegakkan di server (use case + Zod); UI hanya menyajikan.
 */
export async function savePendudukAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = pendudukFormSchema.safeParse({
    nationalId: text(formData, "nationalId"),
    familyId: text(formData, "familyId"),
    name: text(formData, "name"),
    gender: text(formData, "gender"),
    birthPlace: text(formData, "birthPlace"),
    birthDate: text(formData, "birthDate"),
    religionId: text(formData, "religionId"),
    educationId: text(formData, "educationId"),
    occupationId: text(formData, "occupationId"),
    maritalStatusId: text(formData, "maritalStatusId"),
    familyRelationId: text(formData, "familyRelationId"),
    bloodTypeId: text(formData, "bloodTypeId"),
    citizenshipId: text(formData, "citizenshipId"),
    residenceStatus: text(formData, "residenceStatus"),
    lifeStatus: text(formData, "lifeStatus"),
    regionId: text(formData, "regionId"),
    address: text(formData, "address"),
    phone: text(formData, "phone"),
    fatherName: text(formData, "fatherName"),
    motherName: text(formData, "motherName"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createPenduduk(parsed.data);
    } else {
      await updatePenduduk(id, parsed.data);
    }

    revalidatePath(PENDUDUK_PATH);
    return successState(id === null ? "Data penduduk ditambahkan." : "Data penduduk diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus penduduk berdasarkan `id`. */
export async function deletePendudukAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data penduduk tidak valid.");
  }

  try {
    await deletePenduduk(id);
    revalidatePath(PENDUDUK_PATH);
    return successState("Data penduduk dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
