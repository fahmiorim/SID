import { getSuratPrintDataWarga } from "@/features/surat/application/surat-use-cases";
import { buildVerificationUrl } from "@/features/surat/domain/verifikasi";
import { buildSuratPdf } from "@/features/surat/infrastructure/surat-pdf";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";
import { getRequestOrigin } from "@/lib/request-origin";

/**
 * PDF surat untuk warga pemilik.
 *
 * `getSuratPrintDataWarga` membatasi surat pada `residentId` sesi dan hanya
 * status `issued`. Parameter `id` adalah id surat, bukan id permohonan.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/layanan-mandiri/surat/[id]/pdf">,
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sesi Anda telah berakhir.", { status: 401 });
  if (user.residentId === null) return new Response("Bukan akun warga.", { status: 403 });

  const { id } = await params;
  const suratId = Number(id);
  if (!Number.isInteger(suratId) || suratId <= 0) {
    return new Response("Surat tidak valid.", { status: 400 });
  }

  try {
    const { surat, jenis, desa, content } = await getSuratPrintDataWarga(suratId);
    const origin = await getRequestOrigin();
    const verificationUrl = surat.verificationToken
      ? buildVerificationUrl(origin, surat.verificationToken)
      : null;

    const pdf = await buildSuratPdf({
      desa,
      jenisNama: jenis.name,
      nomor: surat.number,
      tanggal: surat.letterDate,
      content,
      verificationUrl,
    });

    const filename = `surat-${(surat.number ?? String(surat.id)).replace(/[^a-zA-Z0-9._-]+/g, "-")}.pdf`;

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return new Response(error.message, { status: error.code === "NOT_FOUND" ? 404 : 403 });
    }

    console.error("Gagal membuat PDF surat warga:", error);
    return new Response("Gagal membuat PDF surat.", { status: 500 });
  }
}
