import { NextResponse } from "next/server";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { eksporInventarisPublik } from "@/features/inventaris/application/inventaris-publik-use-cases";
import { parseInventarisFilter } from "@/features/inventaris/domain/inventaris-publik";

/**
 * Ekspor CSV publik inventaris (OS-WEB-011).
 *
 * Desa diambil dari host permintaan (bukan input klien); filter mengikuti
 * parameter yang sama dengan halaman `/desa/inventaris`, sehingga berkas yang
 * diunduh sama dengan tabel yang sedang dilihat warga.
 */
export async function GET(request: Request) {
  const desa = await getIdentitasFromRequest();
  const { searchParams } = new URL(request.url);
  const filter = parseInventarisFilter(Object.fromEntries(searchParams));

  const { filename, csv } = await eksporInventarisPublik(desa.id, filter, desa.namaDesa);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
