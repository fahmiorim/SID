import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { exportKontakUseCase } from "@/features/kontak/application/use-cases";
import { KONTAK_RESOURCE } from "@/features/kontak/domain/kontak";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export async function GET(
  _request: Request,
  _context: RouteContext<"/hubung-warga/daftar-kontak/ekspor">,
) {
  const user = await verifySession();
  if (!user) {
    return new Response("Sesi Anda telah berakhir.", { status: 401 });
  }
  if (!hasPermission(user.permissions, KONTAK_RESOURCE, "read")) {
    return new Response("Anda tidak memiliki hak akses.", { status: 403 });
  }

  try {
    const villageId = await resolveVillageId(user);
    const result = await exportKontakUseCase(villageId);
    if (!result) {
      return new Response("Belum ada data kontak untuk diexport.", { status: 404 });
    }

    return new Response(result.csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Gagal membuat ekspor kontak:", error);
    return new Response("Gagal membuat ekspor kontak.", { status: 500 });
  }
}
