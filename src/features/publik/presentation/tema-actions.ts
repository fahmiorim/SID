"use server";

import { revalidatePath } from "next/cache";

import { gantiTemaAktif, simpanPengaturanTema } from "@/features/publik/application/tema-use-cases";
import { pengaturanTemaSchema } from "@/features/publik/domain/tema";
import { HOME_SECTION_IDS } from "@/features/publik/domain/theme";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const TEMA_PATH = "/konten/tema";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Simpan opsi tema situs publik.
 *
 * Otorisasi diperiksa di dalam use case (`simpanPengaturanTema`), sehingga
 * memanggil action ini lewat jalur lain pun tetap terlindungi.
 */
export async function simpanTemaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const beranda = formData
      .getAll("beranda")
      .filter((value): value is string => typeof value === "string")
      .filter((value) => (HOME_SECTION_IDS as readonly string[]).includes(value));

    const parsed = pengaturanTemaSchema.safeParse({
      warnaPrimer: text(formData, "warnaPrimer"),
      warnaSekunder: text(formData, "warnaSekunder"),
      font: text(formData, "font"),
      kelengkungan: text(formData, "kelengkungan"),
      heroJudul: text(formData, "heroJudul"),
      heroTombol: text(formData, "heroTombol"),
      heroTombolUrl: text(formData, "heroTombolUrl"),
      headerVarian: text(formData, "headerVarian"),
      beranda,
      tampilMenu: formData.get("tampilMenu") === "on",
      tampilKontakFooter: formData.get("tampilKontakFooter") === "on",
    });

    if (!parsed.success) {
      return errorState("Periksa kembali isian tema.", zodToFieldErrors(parsed.error));
    }

    await simpanPengaturanTema(parsed.data);
    revalidatePath(TEMA_PATH);
    revalidatePath("/", "layout");
    return successState("Pengaturan tema disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Aktifkan salah satu tema terpasang untuk desa. */
export async function gantiTemaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const slug = text(formData, "slug");
    if (!slug) return errorState("Tema tidak dipilih.");

    await gantiTemaAktif(slug);
    revalidatePath(TEMA_PATH);
    revalidatePath("/", "layout");
    return successState("Tema aktif diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}
