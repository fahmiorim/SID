"use server";

import { revalidatePath } from "next/cache";

import {
  createMenu,
  deleteMenu,
  listMenu,
  updateMenu,
} from "@/features/konten/application/menu-use-cases";
import type { MenuPublikRingkas } from "@/features/publik/infrastructure/content-repository";

const PATH = "/konten/menu";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseId(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function daftarMenu(
  _previousState: unknown,
  _formData: FormData,
): Promise<MenuPublikRingkas[]> {
  try {
    return await listMenu({ search: "", status: "", page: 1 });
  } catch {
    return [];
  }
}

export async function tambahMenu(
  _previousState: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const nama = text(formData, "nama");
  const link = text(formData, "link");
  const linkTipe = text(formData, "linkTipe") === "external" ? "external" : "internal";
  const urut = Number(text(formData, "urut") || "0");

  if (!nama || !link) {
    return { success: false, error: "Nama dan link wajib diisi." };
  }

  try {
    await createMenu({ nama, link, linkTipe, urut: Number.isFinite(urut) ? urut : 0 });
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Gagal menambah menu." };
  }
}

export async function ubahMenu(
  _previousState: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const id = parseId(formData.get("id"));
  const nama = text(formData, "nama");
  const link = text(formData, "link");
  const linkTipe = text(formData, "linkTipe") === "external" ? "external" : "internal";
  const urut = Number(text(formData, "urut") || "0");

  if (!id || !nama || !link) {
    return { success: false, error: "ID, nama, dan link wajib diisi." };
  }

  try {
    await updateMenu(id, { nama, link, linkTipe, urut: Number.isFinite(urut) ? urut : 0 });
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Gagal mengubah menu." };
  }
}

export async function hapusMenu(
  _previousState: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const id = parseId(formData.get("id"));

  if (!id) {
    return { success: false, error: "ID menu wajib diisi." };
  }

  try {
    await deleteMenu(id);
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Gagal menghapus menu." };
  }
}
