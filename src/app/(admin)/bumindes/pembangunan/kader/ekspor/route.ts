import { exportBukuKaderCsvData } from "@/features/bumindes/application/use-cases";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

export async function GET() {
  const user = await verifySession();
  if (!user) return new Response("Sesi Anda telah berakhir.", { status: 401 });
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return new Response("Anda tidak memiliki hak akses.", { status: 403 });
  }
  try {
    const hasil = await exportBukuKaderCsvData();
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
    console.error("Gagal membuat ekspor buku kader:", error);
    return new Response("Gagal membuat ekspor buku.", { status: 500 });
  }
}
