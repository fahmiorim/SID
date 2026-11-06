"use server";

import { revalidatePath } from "next/cache";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { kirimUmpanBalik } from "@/features/umpan-balik/application/umpan-balik-use-cases";
import { umpanBalikSchema } from "@/features/umpan-balik/domain/umpan-balik";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";
import { periksaCaptcha } from "@/lib/captcha";
import { env } from "@/lib/env";

/**
 * Kirim umpan balik dari halaman kontak publik.
 *
 * Tenant diambil dari host permintaan (bukan formulir). Captcha aritmetika
 * bertanda tangan dan honeypot menahan pengiriman otomatis; pesan tetap
 * divalidasi ulang di server.
 */
export async function kirimUmpanBalikAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const desa = await getIdentitasFromRequest();
    if (!desa?.id) return errorState("Desa tidak ditemukan.");

    // Honeypot: kolom tersembunyi yang hanya diisi bot.
    if (String(formData.get("website") ?? "").trim() !== "") {
      return successState("Terima kasih! Umpan balik Anda sudah kami terima.");
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

    const parsed = umpanBalikSchema.safeParse({
      nama: String(formData.get("nama") ?? ""),
      kontak: String(formData.get("kontak") ?? ""),
      pesan: String(formData.get("pesan") ?? ""),
    });

    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }

    await kirimUmpanBalik(desa.id, parsed.data);
    revalidatePath("/desa/kontak");
    return successState("Terima kasih! Umpan balik Anda sudah kami terima.");
  } catch (error) {
    return toErrorState(error);
  }
}
