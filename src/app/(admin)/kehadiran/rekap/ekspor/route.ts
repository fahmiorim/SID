import { NextResponse } from "next/server";

import { getRekapKehadiranData } from "@/features/kehadiran/application/kehadiran-use-cases";
import { verifySession } from "@/lib/dal";

/**
 * Ekspor rekap kehadiran ke CSV.
 *
 * Tenant & izin diperiksa lewat sesi; `villageId` tidak pernah berasal dari URL.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const bulanan = url.searchParams.get("bulan") ? Number(url.searchParams.get("bulan")) : undefined;
  const tahun = url.searchParams.get("tahun")
    ? Number(url.searchParams.get("tahun"))
    : new Date().getFullYear();

  const user = await verifySession();
  if (!user.villageId) {
    return new NextResponse("Tidak ada desa.", { status: 404 });
  }

  const rekap = await getRekapKehadiranData(user.villageId, tahun, bulanan);

  // Header CSV
  const header = "Perangkat,Jabatan,Hadir,Izin,Sakit,Alpa\n";
  const rows = rekap.map(
    (item) => `${item.nama},${item.jabatan},${item.hadir},${item.izin},${item.sakit},${item.alpa}`,
  );

  const csvContent = header + rows.join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Disposition": `attachment; filename="rekap_kehadiran_${tahun}${
        bulanan ? `_bulan_${bulanan}` : ""
      }.csv`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
