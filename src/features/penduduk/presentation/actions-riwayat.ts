"use server";

import { revalidatePath } from "next/cache";

import {
  catatDatang,
  catatKelahiran,
  catatKematian,
  catatPerubahan,
  catatPindahKeluar,
} from "@/features/penduduk/application/riwayat-penduduk-use-cases";
import {
  catatDatangSchema,
  catatKelahiranSchema,
  catatKematianSchema,
  catatPerubahanSchema,
  catatPindahKeluarSchema,
} from "@/features/penduduk/domain/riwayat-penduduk";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PENDUDUK_PATH = "/penduduk";
const RIWAYAT_PATH = "/penduduk/riwayat";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  const t = value.trim();
  return t === "" ? "" : t;
}

export async function catatKelahiranAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = catatKelahiranSchema.safeParse({
      eventDate: text(formData, "eventDate"),
      name: text(formData, "name"),
      nationalId: text(formData, "nationalId"),
      gender: text(formData, "gender"),
      fatherName: text(formData, "fatherName"),
      motherName: text(formData, "motherName"),
      address: text(formData, "address"),
      referenceNo: text(formData, "referenceNo"),
      reason: text(formData, "reason"),
      notes: text(formData, "notes"),
      familyId: num(formData, "familyId"),
      regionId: num(formData, "regionId"),
    });
    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }
    await catatKelahiran(parsed.data);
    revalidatePath(PENDUDUK_PATH);
    revalidatePath(RIWAYAT_PATH);
    return successState("Kelahiran berhasil dicatat.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function catatKematianAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = catatKematianSchema.safeParse({
      residentId: num(formData, "residentId"),
      eventDate: text(formData, "eventDate"),
      referenceNo: text(formData, "referenceNo"),
      reason: text(formData, "reason"),
      notes: text(formData, "notes"),
    });
    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }
    await catatKematian(parsed.data);
    revalidatePath(PENDUDUK_PATH);
    revalidatePath(RIWAYAT_PATH);
    return successState("Kematian berhasil dicatat.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function catatPindahKeluarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = catatPindahKeluarSchema.safeParse({
      residentId: num(formData, "residentId"),
      eventDate: text(formData, "eventDate"),
      toAddress: text(formData, "toAddress"),
      destination: text(formData, "destination"),
      referenceNo: text(formData, "referenceNo"),
      reason: text(formData, "reason"),
      notes: text(formData, "notes"),
    });
    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }
    await catatPindahKeluar(parsed.data);
    revalidatePath(PENDUDUK_PATH);
    revalidatePath(RIWAYAT_PATH);
    return successState("Pindah keluar berhasil dicatat.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function catatPerubahanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = catatPerubahanSchema.safeParse({
      residentId: num(formData, "residentId"),
      eventDate: text(formData, "eventDate"),
      lifeStatus: text(formData, "lifeStatus"),
      referenceNo: text(formData, "referenceNo"),
      reason: text(formData, "reason"),
      notes: text(formData, "notes"),
    });
    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }
    await catatPerubahan(parsed.data);
    revalidatePath(PENDUDUK_PATH);
    revalidatePath(RIWAYAT_PATH);
    return successState("Perubahan status berhasil dicatat.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function catatDatangAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = catatDatangSchema.safeParse({
      eventDate: text(formData, "eventDate"),
      name: text(formData, "name"),
      nationalId: text(formData, "nationalId"),
      gender: text(formData, "gender"),
      birthDate: text(formData, "birthDate"),
      birthPlace: text(formData, "birthPlace"),
      address: text(formData, "address"),
      fromAddress: text(formData, "fromAddress"),
      referenceNo: text(formData, "referenceNo"),
      reason: text(formData, "reason"),
      notes: text(formData, "notes"),
      familyId: num(formData, "familyId"),
      regionId: num(formData, "regionId"),
    });
    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }
    await catatDatang(parsed.data);
    revalidatePath(PENDUDUK_PATH);
    revalidatePath(RIWAYAT_PATH);
    return successState("Kedatangan berhasil dicatat.");
  } catch (error) {
    return toErrorState(error);
  }
}
