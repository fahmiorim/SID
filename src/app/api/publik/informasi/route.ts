import { jalankanApiPublik } from "@/features/api-publik/application/public-api";
import { daftarBerita, profilDesaPublik } from "@/features/publik/application/konten-publik";
import { listDokumenPublik } from "@/features/publik/infrastructure/content-repository";

/**
 * GET /api/publik/informasi
 *
 * Profil desa, berita terbaru, dan dokumen publik aktif. Desa di-resolve dari
 * header `Host`; laju permintaan dibatasi per IP dan akses dicatat ke audit.
 */
export async function GET(request: Request) {
  return jalankanApiPublik(request, "informasi", async (desa) => {
    const [profil, berita, dokumen] = await Promise.all([
      profilDesaPublik(desa.id),
      daftarBerita(desa.id),
      listDokumenPublik(desa.id),
    ]);

    return { profilDesa: profil, berita, dokumen };
  });
}
