import { Resend } from "resend";

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
export async function notifikasiStatusPengaduan({
  id: _id,
  nomorTiket,
  statusLama,
  statusBaru,
  emailPelapor,
  namaPelapor,
}: {
  id: number;
  nomorTiket: string;
  statusLama: string;
  statusBaru: string;
  emailPelapor: string | null;
  namaPelapor: string;
}) {
  // Jika email pelapor kosong, lewatkan kirim email
  if (!emailPelapor) {
    console.log(`[notifikasi] Tidak ada email untuk pengaduan ${nomorTiket}, lewatkan kirim email`);
    return { success: true, message: "No email address, skipped" };
  }

  // Cek apakah RESEND_API_KEY tersedia
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[notifikasi] RESEND_API_KEY not configured, notifikasi email dilewati untuk pengaduan ${nomorTiket}`,
    );
    // Catat bahwa notifikasi tidak terkirim tapi jangan gagalkan aksi pengaduan
    return {
      success: true,
      message: "RESEND_API_KEY not configured, notification skipped",
      skipped: true,
    };
  }

  // Jika sudah ada API key, lanjutkan pengiriman email
  const resend = new Resend(apiKey);
  const tiketAman = escapeHtml(nomorTiket);
  const namaAman = escapeHtml(namaPelapor);
  const statusLamaAman = escapeHtml(statusLama);
  const statusBaruAman = escapeHtml(statusBaru);

  try {
    const { data, error } = await resend.emails.send({
      from: "SID Desa <notifikasi@sid-desa.id>",
      to: emailPelapor,
      subject: `[SID Desa] Status Pengaduan ${nomorTiket} Berubah`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Notifikasi Status Pengaduan</h2>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 20px 0;">
            <p><strong>Nomor Tiket:</strong> ${tiketAman}</p>
            <p><strong>Nama Pelapor:</strong> ${namaAman}</p>
            <p><strong>Status Lama:</strong> ${statusLamaAman}</p>
            <p><strong>Status Baru:</strong> <span style="color: #dc2626; font-weight: bold;">${statusBaruAman}</span></p>
          </div>
          <div style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            <p>Ini adalah notifikasi otomatis dari Sistem Informasi Desa.</p>
            <p>Jika Anda memiliki pertanyaan, silakan menghubungi dinas yang bertanggung jawab.</p>
          </div>
        </div>
      `,
      text: `
        Notifikasi Status Pengaduan

        Nomor Tiket: ${nomorTiket}
        Nama Pelapor: ${namaPelapor}
        Status Lama: ${statusLama}
        Status Baru: ${statusBaru}

        ---

        Ini adalah notifikasi otomatis dari Sistem Informasi Desa.
        Jika Anda memiliki pertanyaan, silakan menghubungi dinas yang bertanggung jawab.
      `,
    });

    if (error) {
      console.error(`[notifikasi] Gagal mengirim email untuk pengaduan ${nomorTiket}:`, error);
      // Jika email gagal, catat error tapi jangan melembarkan aksi pengaduan
      return { success: false, error: (error as Error).message, skipped: false };
    }

    console.log(`[notifikasi] Email berhasil terkirim untuk pengaduan ${nomorTiket}`, data);
    return { success: true, data, skipped: false };
  } catch (error) {
    // Jika terjadi error lain, catat tapi jangan melempar ke use case
    console.warn(`[notifikasi] Gagal kirim email (akan dilanjutkan tanpa notifikasi):`, error);
    return { success: false, error: (error as Error).message, skipped: false };
  }
}

/** Format status untuk tampilan notifikasi */
export function formatStatusNotifikasi(status: string): string {
  const labels: Record<string, string> = {
    baru: "Baru",
    diproses: "Diproses",
    selesai: "Selesai",
    tolak: "Ditolak",
  };
  return labels[status] || status;
}
