"use server";

import { revalidatePath } from "next/cache";

import type { BerkasUnggahan } from "@/features/publik/domain/media";
import {
  createSuratKeluarData,
  createSuratMasukData,
  deleteSuratKeluarData,
  deleteSuratMasukData,
  tambahDisposisiSuratMasukData,
  tambahEkspedisiSuratKeluarData,
  updateSuratKeluarData,
  updateSuratMasukData,
} from "@/features/surat/application/agenda-use-cases";
import { suratKeluarFormSchema, suratMasukFormSchema } from "@/features/surat/domain/surat";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const MASUK_PATH = "/persuratan/surat-masuk";
const KELUAR_PATH = "/persuratan/surat-keluar";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function isFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof (value as File).arrayBuffer === "function",
  );
}

async function bacaMultiBerkas(formData: FormData, field: string): Promise<BerkasUnggahan[]> {
  const results: BerkasUnggahan[] = [];
  for (const [key, value] of formData.entries()) {
    if (key !== field) continue;
    if (!isFile(value) || value.size === 0) continue;
    results.push({
      nama: value.name,
      mime: value.type || null,
      ukuran: value.size,
      isi: new Uint8Array(await value.arrayBuffer()),
    });
  }
  return results;
}

export async function saveSuratMasukAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = suratMasukFormSchema.safeParse({
    agendaNumber: text(formData, "agendaNumber"),
    receivedDate: text(formData, "receivedDate"),
    letterNumber: text(formData, "letterNumber"),
    letterDate: text(formData, "letterDate"),
    sender: text(formData, "sender"),
    classificationId: text(formData, "classificationId"),
    summary: text(formData, "summary"),
    disposition: text(formData, "disposition"),
    archiveLocation: text(formData, "archiveLocation"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createSuratMasukData(parsed.data);
    } else {
      await updateSuratMasukData(id, parsed.data);
    }
    revalidatePath(MASUK_PATH);
    return successState(id === null ? "Surat masuk dicatat." : "Surat masuk diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteSuratMasukAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data surat masuk tidak valid.");

  try {
    await deleteSuratMasukData(id);
    revalidatePath(MASUK_PATH);
    return successState("Surat masuk dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function saveSuratKeluarAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = suratKeluarFormSchema.safeParse({
    agendaNumber: text(formData, "agendaNumber"),
    letterNumber: text(formData, "letterNumber"),
    letterDate: text(formData, "letterDate"),
    recipient: text(formData, "recipient"),
    classificationId: text(formData, "classificationId"),
    summary: text(formData, "summary"),
    sentDate: text(formData, "sentDate"),
    archiveLocation: text(formData, "archiveLocation"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createSuratKeluarData(parsed.data);
    } else {
      await updateSuratKeluarData(id, parsed.data);
    }
    revalidatePath(KELUAR_PATH);
    return successState(id === null ? "Surat keluar dicatat." : "Surat keluar diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteSuratKeluarAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data surat keluar tidak valid.");

  try {
    await deleteSuratKeluarData(id);
    revalidatePath(KELUAR_PATH);
    return successState("Surat keluar dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function tambahDisposisiSuratMasukAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("incomingLetterId"));
  if (id === null) return errorState("Data surat masuk tidak valid.");
  const instruction = text(formData, "instruction");
  if (!instruction) return errorState("Instruksi disposisi wajib diisi.");

  const lampiran = await bacaMultiBerkas(formData, "lampiran");
  if (lampiran.length > 5) return errorState("Maksimal 5 berkas lampiran.");

  try {
    await tambahDisposisiSuratMasukData(id, {
      toUserId: text(formData, "toUserId") || null,
      toRole: text(formData, "toRole") || null,
      instruction,
      dueDate: text(formData, "dueDate") || null,
      note: text(formData, "note") || null,
      lampiran: lampiran.length > 0 ? lampiran : undefined,
    });
    revalidatePath(MASUK_PATH);
    return successState("Disposisi surat masuk ditambahkan.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function tambahEkspedisiSuratKeluarAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("outgoingLetterId"));
  if (id === null) return errorState("Data surat keluar tidak valid.");
  const sentDate = text(formData, "sentDate");
  if (!sentDate) return errorState("Tanggal kirim wajib diisi.");

  const lampiran = await bacaMultiBerkas(formData, "lampiran");
  if (lampiran.length > 5) return errorState("Maksimal 5 berkas lampiran.");

  try {
    await tambahEkspedisiSuratKeluarData(id, {
      sentDate,
      recipient: text(formData, "recipient") || null,
      deliveryMethod: text(formData, "deliveryMethod") || null,
      trackingNo: text(formData, "trackingNo") || null,
      note: text(formData, "note") || null,
      lampiran: lampiran.length > 0 ? lampiran : undefined,
    });
    revalidatePath(KELUAR_PATH);
    return successState("Ekspedisi surat keluar dicatat.");
  } catch (error) {
    return toErrorState(error);
  }
}
