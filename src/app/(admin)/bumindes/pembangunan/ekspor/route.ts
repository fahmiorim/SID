import { exportBukuPembangunanCsvData } from "@/features/bumindes/application/use-cases";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

export async function GET(request: Request) {
  const user = await verifySession();
  if (!user) return new Response("Sesi Anda telah berakhir.", { status: 401 });
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return new Response("Anda tidak memiliki hak akses.", { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get("tahun");
    const t = tahun ? Number(tahun) : undefined;
    const hasil = await exportBukuPembangunanCsvData(Number.isFinite(t) ? t : undefined);
    return new Response(hasil.csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${hasil.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (isAppError(error) && error.code === "FORBIDDEN") {
      return new Response("Anda tidak memiliki hak akses.", { status: 403 });
    }
    console.error("Gagal membuat ekspor buku pembangunan:", error);
    return new Response("Gagal membuat ekspor buku.", { status: 500 });
  }
}
