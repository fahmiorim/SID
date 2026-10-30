"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import {
  createArea,
  createGaris,
  createPersil,
  createPoint,
  createPolygon,
  createSimbol,
  deleteArea,
  deleteGaris,
  deletePersil,
  deletePoint,
  deletePolygon,
  deleteSimbol,
  updateArea,
  updateGaris,
  updatePersil,
  updatePoint,
  updatePolygon,
  updateSimbol,
} from "@/features/gis/application/use-cases";
import {
  AREA_RESOURCE,
  areaFormSchema,
  GARIS_RESOURCE,
  garisFormSchema,
  persilFormSchema,
  PERTANAHAN_RESOURCE,
  POINT_RESOURCE,
  pointFormSchema,
  POLYGON_RESOURCE,
  polygonFormSchema,
  SIMBOL_RESOURCE,
  simbolFormSchema,
} from "@/features/gis/domain/gis";
import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { requirePermission } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

function formNumber(formData: FormData, key: string): number {
  return Number(formData.get(key));
}

function nullableFormNumber(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  return value ? Number(value) : null;
}

function formText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return value ? String(value) : null;
}

function readId(formData: FormData): number | null {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

// --- Polygon Actions --------------------------------------------------------

export async function createPolygonAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    await requirePermission(POLYGON_RESOURCE, "update");
    const input = polygonFormSchema.parse({
      nama: formData.get("nama"),
      simbol: formText(formData, "simbol"),
      color: formText(formData, "color"),
      tipe: formNumber(formData, "tipe"),
      parrent: nullableFormNumber(formData, "parrent"),
      enabled: formData.get("enabled") === "on",
      sortOrder: formNumber(formData, "sortOrder"),
    });
    const newPolygon = await createPolygon(input);
    revalidatePath("/pemetaan/polygon");
    return successState("Polygon berhasil dibuat.", { id: newPolygon.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat polygon.");
  }
}

export async function updatePolygonAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(POLYGON_RESOURCE, "update");
    const input = polygonFormSchema.parse({
      nama: formData.get("nama"),
      simbol: formText(formData, "simbol"),
      color: formText(formData, "color"),
      tipe: formNumber(formData, "tipe"),
      parrent: nullableFormNumber(formData, "parrent"),
      enabled: formData.get("enabled") === "on",
      sortOrder: formNumber(formData, "sortOrder"),
    });
    await updatePolygon(id, input);
    revalidatePath("/pemetaan/polygon");
    return successState("Polygon berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui polygon.");
  }
}

export async function deletePolygonAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(POLYGON_RESOURCE, "delete");
    await deletePolygon(id);
    revalidatePath("/pemetaan/polygon");
    return successState("Polygon berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus polygon.");
  }
}

// --- Area Actions -----------------------------------------------------------

export async function createAreaAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    await requirePermission(AREA_RESOURCE, "update");
    const input = areaFormSchema.parse({
      nama: formData.get("nama"),
      refPolygon: nullableFormNumber(formData, "refPolygon"),
      path: formText(formData, "path"),
      foto: formText(formData, "foto"),
      desk: formText(formData, "desk"),
      enabled: formData.get("enabled") === "on",
      sortOrder: formNumber(formData, "sortOrder"),
    });
    const _newArea = await createArea(input);
    revalidatePath("/pemetaan/area");
    return successState("Area berhasil dibuat.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat area.");
  }
}

export async function updateAreaAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(AREA_RESOURCE, "update");
    const input = areaFormSchema.parse({
      nama: formData.get("nama"),
      refPolygon: nullableFormNumber(formData, "refPolygon"),
      path: formText(formData, "path"),
      foto: formText(formData, "foto"),
      desk: formText(formData, "desk"),
      enabled: formData.get("enabled") === "on",
      sortOrder: formNumber(formData, "sortOrder"),
    });
    await updateArea(id, input);
    revalidatePath("/pemetaan/area");
    return successState("Area berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui area.");
  }
}

export async function deleteAreaAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(AREA_RESOURCE, "delete");
    await deleteArea(id);
    revalidatePath("/pemetaan/area");
    return successState("Area berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus area.");
  }
}

// --- Garis Actions ----------------------------------------------------------

export async function createGarisAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    await requirePermission(GARIS_RESOURCE, "update");
    const input = garisFormSchema.parse({
      nama: formData.get("nama"),
      refLine: nullableFormNumber(formData, "refLine"),
      path: formText(formData, "path"),
      foto: formText(formData, "foto"),
      desk: formText(formData, "desk"),
      enabled: formData.get("enabled") === "on",
      sortOrder: formNumber(formData, "sortOrder"),
    });
    const _newGaris = await createGaris(input);
    revalidatePath("/pemetaan/garis");
    return successState("Garis berhasil dibuat.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat garis.");
  }
}

export async function updateGarisAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(GARIS_RESOURCE, "update");
    const input = garisFormSchema.parse({
      nama: formData.get("nama"),
      refLine: nullableFormNumber(formData, "refLine"),
      path: formText(formData, "path"),
      foto: formText(formData, "foto"),
      desk: formText(formData, "desk"),
      enabled: formData.get("enabled") === "on",
      sortOrder: formNumber(formData, "sortOrder"),
    });
    await updateGaris(id, input);
    revalidatePath("/pemetaan/garis");
    return successState("Garis berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui garis.");
  }
}

export async function deleteGarisAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(GARIS_RESOURCE, "delete");
    await deleteGaris(id);
    revalidatePath("/pemetaan/garis");
    return successState("Garis berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus garis.");
  }
}

// --- Point Actions ----------------------------------------------------------

function pointInput(formData: FormData) {
  return {
    nama: formData.get("nama"),
    simbol: formText(formData, "simbol"),
    tipe: formNumber(formData, "tipe"),
    parrent: nullableFormNumber(formData, "parrent"),
    path: formText(formData, "path"),
    enabled: formData.get("enabled") === "on",
    sortOrder: formNumber(formData, "sortOrder"),
  };
}

export async function createPointAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    await requirePermission(POINT_RESOURCE, "update");
    const input = pointFormSchema.parse(pointInput(formData));
    const _newPoint = await createPoint(input);
    revalidatePath("/pemetaan/point");
    return successState("Titik berhasil dibuat.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat titik.");
  }
}

export async function updatePointAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(POINT_RESOURCE, "update");
    const input = pointFormSchema.parse(pointInput(formData));
    await updatePoint(id, input);
    revalidatePath("/pemetaan/point");
    return successState("Titik berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui titik.");
  }
}

export async function deletePointAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(POINT_RESOURCE, "delete");
    await deletePoint(id);
    revalidatePath("/pemetaan/point");
    return successState("Titik berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus titik.");
  }
}

// --- Simbol Actions ---------------------------------------------------------

export async function createSimbolAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    await requirePermission(SIMBOL_RESOURCE, "update");
    const input = simbolFormSchema.parse({
      simbol: formData.get("simbol"),
      desk: formText(formData, "desk"),
      sortOrder: formNumber(formData, "sortOrder"),
    });
    const _newSimbol = await createSimbol(input);
    revalidatePath("/pemetaan/simbol");
    return successState("Simbol berhasil dibuat.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat simbol.");
  }
}

export async function updateSimbolAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(SIMBOL_RESOURCE, "update");
    const input = simbolFormSchema.parse({
      simbol: formData.get("simbol"),
      desk: formText(formData, "desk"),
      sortOrder: formNumber(formData, "sortOrder"),
    });
    await updateSimbol(id, input);
    revalidatePath("/pemetaan/simbol");
    return successState("Simbol berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui simbol.");
  }
}

export async function deleteSimbolAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(SIMBOL_RESOURCE, "delete");
    await deleteSimbol(id);
    revalidatePath("/pemetaan/simbol");
    return successState("Simbol berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus simbol.");
  }
}

// --- Persil Actions ---------------------------------------------------------

function persilInput(formData: FormData) {
  return {
    nomor: formData.get("nomor"),
    nomorCdesa: formText(formData, "nomorCdesa"),
    luas: formNumber(formData, "luas"),
    status: formData.get("status"),
    path: formText(formData, "path"),
    keterangan: formText(formData, "keterangan"),
    sortOrder: formNumber(formData, "sortOrder"),
  };
}

export async function createPersilAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    await requirePermission(PERTANAHAN_RESOURCE, "update");
    const input = persilFormSchema.parse(persilInput(formData));
    const _newPersil = await createPersil(input);
    revalidatePath("/pemetaan/pertanahan");
    return successState("Persil berhasil dibuat.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat persil.");
  }
}

export async function updatePersilAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(PERTANAHAN_RESOURCE, "update");
    const input = persilFormSchema.parse(persilInput(formData));
    await updatePersil(id, input);
    revalidatePath("/pemetaan/pertanahan");
    return successState("Persil berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui persil.");
  }
}

export async function deletePersilAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = readId(formData);
  if (id === null) return errorState("ID tidak valid.");
  try {
    await requirePermission(PERTANAHAN_RESOURCE, "delete");
    await deletePersil(id);
    revalidatePath("/pemetaan/pertanahan");
    return successState("Persil berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus persil.");
  }
}
