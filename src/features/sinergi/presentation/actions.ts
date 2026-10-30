"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";
import { verifySession } from "@/lib/dal";

import { hapusSinergi, tambahSinergi, ubahSinergi } from "../application/sinergi-use-cases";

const SINERGI_PATH = "/desa/sinergi";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Simpan program sinergi: tambah bila `id` kosong, ubah bila diisi. */
export async function simpanSinergiAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await verifySession();
    const villageId = await resolveVillageId(user);
    const id = parseId(formData.get("id"));

    const input = {
      nama: text(formData, "nama"),
      mitra: text(formData, "mitra"),
      tahun: text(formData, "tahun") || null,
      tanggalMulai: text(formData, "tanggalMulai"),
      tanggalSelesai: text(formData, "tanggalSelesai"),
      keterangan: text(formData, "keterangan"),
    };

    if (id === null) {
      const hasil = await tambahSinergi(villageId, input);
      revalidatePath(SINERGI_PATH);
      return successState("Program sinergi ditambahkan.", { id: hasil.id });
    }

    await ubahSinergi(villageId, id, input);
    revalidatePath(SINERGI_PATH);
    return successState("Program sinergi diperbarui.", { id });
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusSinergiAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await verifySession();
    const villageId = await resolveVillageId(user);
    const id = parseId(formData.get("id"));
    if (id === null) return errorState("Data tidak valid.");

    await hapusSinergi(villageId, id);
    revalidatePath(SINERGI_PATH);
    return successState("Program sinergi dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
