"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import type { KredensialWarga } from "@/features/warga/domain/warga";
import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { periksaCaptcha } from "@/lib/captcha";
import { env } from "@/lib/env";
import { isAppError } from "@/lib/errors";

import {
  kirimRegistrasiWarga,
  setujuiRegistrasiWargaData,
  tolakRegistrasiWargaData,
} from "../application/registrasi-warga-use-cases";

function pesanKesalahan(error: unknown, fallback: string) {
  if (error instanceof Error && error.name === "ZodError") {
    return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
  }
  return errorState(isAppError(error) ? error.message : fallback);
}

export async function kirimRegistrasiWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    const identitas = await getIdentitasFromRequest();
    if (!identitas?.id) return errorState("Desa tidak ditemukan.");

    // Honeypot: kolom tersembunyi yang hanya diisi bot.
    if (String(formData.get("website") ?? "").trim() !== "") {
      return errorState("Permohonan tidak dapat diproses.");
    }

    const captchaValid = periksaCaptcha(
      env.BETTER_AUTH_SECRET,
      String(formData.get("jawaban") ?? ""),
      String(formData.get("captcha") ?? ""),
    );
    if (!captchaValid) {
      return errorState(
        "Jawaban verifikasi salah atau sudah kedaluwarsa. Muat ulang halaman lalu coba lagi.",
        { jawaban: ["Jawaban verifikasi tidak sesuai."] },
      );
    }

    await kirimRegistrasiWarga(identitas.id, {
      nik: formData.get("nik"),
      nama: formData.get("nama"),
      noHp: formData.get("noHp"),
    });

    revalidatePath("/desa/registrasi-warga");
    return successState(
      "Permohonan akun dikirim. Petugas desa akan memeriksa dan menghubungi Anda.",
    );
  } catch (error) {
    return pesanKesalahan(error, "Gagal mengirim permohonan akun.");
  }
}

export async function setujuiRegistrasiWargaAction(
  _prev: ActionState<KredensialWarga | null>,
  formData: FormData,
): Promise<ActionState<KredensialWarga | null>> {
  try {
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID permohonan tidak valid.");

    const kredensial = await setujuiRegistrasiWargaData(id);
    revalidatePath("/penduduk/registrasi");
    return successState("Permohonan disetujui dan akun warga dibuat.", kredensial);
  } catch (error) {
    return pesanKesalahan(error, "Gagal menyetujui permohonan akun.");
  }
}

export async function tolakRegistrasiWargaAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID permohonan tidak valid.");

    await tolakRegistrasiWargaData(id);
    revalidatePath("/penduduk/registrasi");
    return successState("Permohonan akun ditolak.");
  } catch (error) {
    return pesanKesalahan(error, "Gagal menolak permohonan akun.");
  }
}
