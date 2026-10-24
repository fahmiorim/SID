import { getBerkasSyaratWargaData } from "@/features/layanan-mandiri/application/warga-use-cases";
import { bacaMedia } from "@/features/publik/infrastructure/media-storage";
import { getCurrentUser } from "@/lib/dal";
import { appErrorStatus, isAppError } from "@/lib/errors";

/**
 * Unduh berkas syarat milik warga yang sedang login.
 *
 * Pemeriksaan kepemilikan dilakukan di use case (`residentId` sesi), bukan dari
 * parameter URL. Berkas disimpan di media privat dan tidak pernah disajikan
 * lewat route media publik.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/layanan-mandiri/permohonan/[id]/syarat/[syaratId]">,
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sesi Anda telah berakhir.", { status: 401 });
  if (user.residentId === null) return new Response("Bukan akun warga.", { status: 403 });

  const { id, syaratId } = await params;
  const permohonanId = Number(id);
  const syarat = Number(syaratId);

  if (!Number.isInteger(permohonanId) || permohonanId <= 0) {
    return new Response("Permohonan tidak valid.", { status: 400 });
  }
  if (!Number.isInteger(syarat) || syarat <= 0) {
    return new Response("Syarat tidak valid.", { status: 400 });
  }

  try {
    const berkas = await getBerkasSyaratWargaData(permohonanId, syarat);
    const isi = await bacaMedia(berkas.berkas);
    const nama = berkas.namaAsli.replace(/[^\w.\- ]+/g, "_") || "berkas";

    return new Response(new Uint8Array(isi), {
      headers: {
        "Content-Type": berkas.mime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${nama}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return new Response(error.message, { status: appErrorStatus(error.code) });
    }

    console.error("Gagal membaca berkas syarat warga:", error);
    return new Response("Gagal membaca berkas.", { status: 500 });
  }
}
