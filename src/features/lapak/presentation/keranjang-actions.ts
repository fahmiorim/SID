"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  hapusDariKeranjang,
  tambahKeKeranjang,
  updateJumlahKeranjang,
} from "@/features/lapak/application/keranjang-use-cases";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { env } from "@/lib/env";
import { AppError, isAppError } from "@/lib/errors";

/** Buat session key untuk keranjang belanja. */
async function getSessionKey(): Promise<string> {
  const cookieStore = await cookies();
  let key = cookieStore.get("lapak_session")?.value;
  if (!key) {
    key = randomBytes(32).toString("hex");
    cookieStore.set("lapak_session", key, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    });
  }
  return key;
}

/** villageId selalu berasal dari host, tidak pernah dari input klien. */
async function getVillageId(): Promise<number> {
  const identitas = await getIdentitasFromRequest();
  if (!identitas?.id) throw new AppError("NOT_FOUND", "Desa tidak ditemukan.");
  return identitas.id;
}

export async function addToCartAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const sessionKey = await getSessionKey();
    const villageId = await getVillageId();
    const lapakId = Number(formData.get("lapakId"));
    const produkId = Number(formData.get("produkId"));
    const jumlah = Number(formData.get("jumlah")) || 1;

    if (!lapakId || !produkId) return errorState("Data produk tidak valid.");

    await tambahKeKeranjang(sessionKey, villageId, lapakId, produkId, jumlah);
    revalidatePath("/desa/lapak/keranjang");
    return successState("Produk berhasil ditambahkan ke keranjang.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menambah ke keranjang.");
  }
}

export async function removeFromCartAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const sessionKey = await getSessionKey();
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");

    await hapusDariKeranjang(sessionKey, id);
    revalidatePath("/desa/lapak/keranjang");
    return successState("Produk berhasil dihapus dari keranjang.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus dari keranjang.");
  }
}

export async function updateCartQuantityAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const sessionKey = await getSessionKey();
    const id = Number(formData.get("id"));
    const jumlah = Number(formData.get("jumlah"));
    if (!id || !jumlah) return errorState("Data tidak valid.");

    await updateJumlahKeranjang(sessionKey, id, jumlah);
    revalidatePath("/desa/lapak/keranjang");
    return successState("Jumlah berhasil diperbarui.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui jumlah.");
  }
}
