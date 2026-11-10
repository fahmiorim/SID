"use server";

import { revalidatePath } from "next/cache";

import { hapusAgenda, simpanAgenda } from "@/features/agenda/application/agenda-use-cases";
import { agendaFormSchema } from "@/features/agenda/domain/agenda";
import { booleanValue, parseId, text } from "@/features/konten/presentation/form-utils";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH = "/konten/agenda";

export async function saveAgendaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = agendaFormSchema.safeParse({
    judul: text(formData, "judul"),
    mulai: text(formData, "mulai"),
    selesai: text(formData, "selesai"),
    lokasi: text(formData, "lokasi"),
    deskripsi: text(formData, "deskripsi"),
    tayang: booleanValue(formData, "tayang"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data agenda.", zodToFieldErrors(parsed.error));
  }

  try {
    const id = parseId(formData.get("id"));
    await simpanAgenda(parsed.data, id);
    revalidatePath(PATH);
    revalidatePath("/desa/agenda");
    revalidatePath("/");
    return successState(
      id === undefined ? "Agenda berhasil ditambahkan." : "Agenda berhasil diubah.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteAgendaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === undefined) return errorState("Agenda yang akan dihapus tidak valid.");

  try {
    await hapusAgenda(id);
    revalidatePath(PATH);
    revalidatePath("/desa/agenda");
    revalidatePath("/");
    return successState("Agenda berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
