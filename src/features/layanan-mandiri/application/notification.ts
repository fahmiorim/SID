import { Resend } from "resend";

import { labelPermohonanStatus } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { findWargaEmailByResident } from "@/features/layanan-mandiri/infrastructure/layanan-mandiri-repository";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Kirim email saat status permohonan berubah.
 *
 * Kegagalan atau ketiadaan kredensial hanya dicatat; status yang sudah
 * tersimpan tidak dibatalkan. Warga tanpa akun/email dilewati.
 */
export async function notifyPermohonanStatusChange(input: {
  villageId: number;
  residentId: number;
  noAntrian: string | null;
  statusLama: number;
  statusBaru: number;
  alasan?: string | null;
}): Promise<void> {
  try {
    const email = await findWargaEmailByResident(input.villageId, input.residentId);
    if (!email) {
      logger.info("[notifikasi] Warga tanpa email; notifikasi permohonan dilewati.", {
        noAntrian: input.noAntrian,
      });
      return;
    }

    const apiKey = env.RESEND_API_KEY;
    const from = env.RESEND_FROM;
    if (!apiKey || !from) {
      logger.warn("[notifikasi] Resend belum dikonfigurasi; email permohonan dilewati.", {
        noAntrian: input.noAntrian,
      });
      return;
    }

    const nomor = input.noAntrian ?? "permohonan Anda";
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject: `[Layanan Desa] Status Permohonan ${nomor} Berubah`,
      html: `
        <p>Hai,</p>
        <p>Status permohonan surat <strong>${escapeHtml(nomor)}</strong> telah berubah.</p>
        <p><strong>Dari:</strong> ${escapeHtml(labelPermohonanStatus(input.statusLama))}</p>
        <p><strong>Menjadi:</strong> ${escapeHtml(labelPermohonanStatus(input.statusBaru))}</p>
        ${
          input.alasan
            ? `<p><strong>Catatan operator:</strong> ${escapeHtml(input.alasan)}</p>`
            : ""
        }
        <p>Buka area Layanan Mandiri untuk melihat rincian permohonan.</p>
      `,
    });

    if (error) {
      logger.warn("[notifikasi] Resend menolak email permohonan.", {
        noAntrian: input.noAntrian,
        error: error.message,
      });
      return;
    }

    logger.info("[notifikasi] Email perubahan status permohonan diterima Resend.", {
      noAntrian: input.noAntrian,
      emailId: data?.id,
    });
  } catch (error) {
    logger.warn("[notifikasi] Gagal mengirim email permohonan.", {
      noAntrian: input.noAntrian,
      error: error instanceof Error ? error.message : "kesalahan tidak diketahui",
    });
  }
}
