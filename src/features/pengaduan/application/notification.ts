import { Resend } from "resend";

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
 * Kirim notifikasi email saat status pengaduan berubah.
 *
 * Fungsi ini akan mengirim email ke pelapor pengaduan ketika status
 * pengaduan berubah (oleh petugas/admin). Jika RESEND_API_KEY tidak
 * dikonfigurasi, notifikasi ini hanya akan dicatat ke console dan
 * aksi pengaduan tetap berhasil.
 *
 * Dipanggil dari use case setelah status pengaduan di-update.
 */
export async function notifyStatusChange(
  nomorTiket: string,
  email: string,
  statusBaru: string,
  statusLama: string,
): Promise<{
  success: boolean;
  message: string;
  skipped: boolean;
  data?: unknown;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn(
      `[notifikasi] RESEND_API_KEY not configured, notifikasi email dilewati untuk pengaduan ${nomorTiket}`,
      {},
    );
    // Catat bahwa notifikasi tidak terkirim tapi jangan gagalkan aksi pengaduan
    return {
      success: true,
      message: "RESEND_API_KEY not configured, notification skipped",
      skipped: true,
    };
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: "SID Desa <notifikasi@desa.id>",
      to: [email],
      subject: `[Notifikasi] Status Pengaduan ${nomorTiket} Berubah`,
      html: `
        <p>Hai,</p>
        <p>Status pengaduan dengan nomor <strong>${nomorTiket}</strong> telah berubah.</p>
        <p><strong>Dari:</strong> ${escapeHtml(statusLama)}</p>
        <p><strong>Menjadi:</strong> ${escapeHtml(statusBaru)}</p>
        <p>Terima kasih telah menggunakan layanan pengaduan desa.</p>
      `,
    });

    logger.info(`[notifikasi] Email berhasil terkirim untuk pengaduan ${nomorTiket}`, {});
    console.log(`[notifikasi] Email berhasil terkirim untuk pengaduan ${nomorTiket}`, data);
    return { success: true, message: "Email terkirim", data, skipped: false };
  } catch (error) {
    // Jika terjadi error lain, catat tapi jangan melempar ke use case
    logger.warn(`[notifikasi] Gagal kirim email (akan dilanjutkan tanpa notifikasi):`, { error });
    return {
      success: false,
      message: "Gagal mengirim notifikasi email",
      error: (error as Error).message,
      skipped: false,
    };
  }
}

/** Format status untuk tampilan notifikasi */
export function formatStatusForNotifikasi(status: string): string {
  switch (status) {
    case "baru":
      return "Baru";
    case "proses":
      return "Dalam Proses";
    case "selesai":
      return "Selesai";
    case "ditolak":
      return "Ditolak";
    default:
      return status;
  }
}
