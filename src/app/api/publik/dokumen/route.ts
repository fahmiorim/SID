import { jalankanApiPublik } from "@/features/api-publik/application/public-api";
import { parseDokumenKategoriFilter, parsePaginasiDokumen } from "@/features/publik/domain/dokumen";
import { cariDokumenPublik } from "@/features/publik/infrastructure/content-repository";

/**
 * GET /api/publik/dokumen
 *
 * Dokumen aktif dengan filter `kategori` dan paginasi `page`/`pageSize`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kategoriInput = searchParams.get("kategori")?.trim() ?? "";
  const kategori = parseDokumenKategoriFilter(kategoriInput || undefined);
  const paginasi = parsePaginasiDokumen(searchParams.get("page"), searchParams.get("pageSize"));

  if (kategoriInput && kategori === "semua") {
    return Response.json(
      { success: false, error: "Kategori dokumen tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!paginasi) {
    return Response.json(
      { success: false, error: "Parameter page atau pageSize tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return jalankanApiPublik(
    request,
    "dokumen",
    (desa) =>
      cariDokumenPublik(desa.id, {
        search: "",
        category: kategori,
        page: paginasi.page,
        pageSize: paginasi.pageSize,
      }),
    ({ rows, total, page, pageSize }) => ({
      data: rows,
      pagination: { page, pageSize, totalItems: total, totalPages: Math.ceil(total / pageSize) },
    }),
  );
}
