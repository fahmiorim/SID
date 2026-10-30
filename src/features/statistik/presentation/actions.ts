"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  createRentangUmurUseCase,
  deleteRentangUmurUseCase,
  listRentangUmurUseCase,
  updateRentangUmurUseCase,
} from "@/features/statistik/application/rentang-umur-use-cases";
import {
  rentangUmurFormSchema,
  type RentangUmurDTO,
} from "@/features/statistik/domain/rentang-umur";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";
import { verifySession } from "@/lib/dal";

const RENTANG_UMUR_PATH = "/statistik/rentang-umur";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(formData: FormData, name: string): number | null {
  const raw = text(formData, name);
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function listRentangUmurAction(
  _prevState: ActionState<RentangUmurDTO[]>,
  formData: FormData,
): Promise<ActionState<RentangUmurDTO[]>> {
  try {
    const user = await verifySession();
    const villageId = await resolveVillageId(user);
    const search = text(formData, "search");
    const rows = await listRentangUmurUseCase({ villageId, search: search || undefined });
    return successState("Berhasil memuat data.", rows);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function createRentangUmurAction(
  _prevState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const validated = rentangUmurFormSchema.parse({
      nama: text(formData, "nama"),
      dari: parseNumber(formData, "dari"),
      sampai: parseNumber(formData, "sampai"),
    });

    const user = await verifySession();
    const villageId = await resolveVillageId(user);
    await createRentangUmurUseCase(villageId, validated);
    revalidatePath(RENTANG_UMUR_PATH);
    return successState("Rentang umur berhasil ditambahkan.", { id: 0 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return errorState("Data yang dikirim tidak valid.", zodToFieldErrors(error as ZodError));
    }
    return toErrorState(error);
  }
}

export async function updateRentangUmurAction(
  _prevState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const id = parseNumber(formData, "id");
    if (!id) throw new Error("ID rentang umur wajib diisi.");

    const validated = rentangUmurFormSchema.parse({
      nama: text(formData, "nama"),
      dari: parseNumber(formData, "dari"),
      sampai: parseNumber(formData, "sampai"),
    });

    const user = await verifySession();
    const villageId = await resolveVillageId(user);
    await updateRentangUmurUseCase(villageId, id, validated);
    revalidatePath(RENTANG_UMUR_PATH);
    return successState("Rentang umur berhasil diubah.", { id: 0 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return errorState("Data yang dikirim tidak valid.", zodToFieldErrors(error as ZodError));
    }
    return toErrorState(error);
  }
}

export async function deleteRentangUmurAction(
  _prevState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const id = parseNumber(formData, "id");
    if (!id) throw new Error("ID rentang umur wajib diisi.");

    const user = await verifySession();
    const villageId = await resolveVillageId(user);
    await deleteRentangUmurUseCase(villageId, id);
    revalidatePath(RENTANG_UMUR_PATH);
    return successState("Rentang umur berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
