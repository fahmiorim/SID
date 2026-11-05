import { jalankanApiPublik } from "@/features/api-publik/application/public-api";
import { listDokumenPublik } from "@/features/publik/infrastructure/content-repository";

/**
 * GET /api/publik/dokumen
 *
 * Daftar dokumen publik aktif. Query: `kategori` (opsional).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get("kategori")?.trim() || undefined;

  return jalankanApiPublik(request, "dokumen", async (desa) => {
    return listDokumenPublik(desa.id, kategori);
  });
}
