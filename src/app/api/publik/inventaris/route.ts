import { jalankanApiPublik } from "@/features/api-publik/application/public-api";
import { listInventaris } from "@/features/inventaris/infrastructure/inventaris-repository";

/**
 * GET /api/publik/inventaris
 *
 * Inventaris publik desa. Query: `search` (opsional) untuk nama/nomor/kode.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";

  return jalankanApiPublik(request, "inventaris", async (desa) => {
    const { rows, total } = await listInventaris(desa.id, search);
    return { items: rows, total };
  });
}
