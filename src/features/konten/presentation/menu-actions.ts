"use server";

import { revalidatePath } from "next/cache";

import {
  createMenuPublik,
  deleteMenuPublik,
  listMenuPublik,
  updateMenuPublik,
} from "@/features/publik/infrastructure/content-repository";

export async function daftarMenu(
  _previousState: unknown,
  _formData: FormData,
): Promise<MenuPublikRingkas[]> {
  try {
    const menus = (await listMenuPublik(0)) as MenuPublikRingkas[];
    return menus;
  } catch (_error) {
    return [];
  }
}

export async function tambahMenu(
  _previousState: unknown,
  _formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const nama = (_formData.get("nama") as string) || "";
  const link = (_formData.get("link") as string) || "";

  if (!nama || !link) {
    return { success: false, error: "Nama dan link wajib diisi." };
  }

  try {
    await createMenuPublik(0, { nama, link, linkTipe: "internal" });
    revalidatePath("/konten/menu");
    return { success: true };
  } catch (_error) {
    if ((_error as Error)?.message?.includes("sudah ada")) {
      return { success: false, error: (_error as Error).message };
    }
    return { success: false, error: "Gagal menambah menu." };
  }
}

export async function ubahMenu(
  _previousState: unknown,
  _formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const id = parseInt((_formData.get("id") as string) || "0");
  const nama = (_formData.get("nama") as string) || "";
  const link = (_formData.get("link") as string) || "";

  if (!id || !nama || !link) {
    return { success: false, error: "ID, nama, dan link wajib diisi." };
  }

  try {
    await updateMenuPublik(0, id, { nama, link });
    revalidatePath("/konten/menu");
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Gagal mengubah menu." };
  }
}

export async function hapusMenu(
  _previousState: unknown,
  _formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const id = parseInt((_formData.get("id") as string) || "0");

  if (!id) {
    return { success: false, error: "ID menu wajib diisi." };
  }

  try {
    await deleteMenuPublik(0, id);
    revalidatePath("/konten/menu");
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Gagal menghapus menu." };
  }
}

export interface MenuPublikRingkas {
  id: number;
  nama: string;
  link: string;
  linkTipe: string;
  urut: number;
  aktif: boolean;
}
