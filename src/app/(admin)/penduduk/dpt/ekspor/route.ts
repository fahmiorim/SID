import { exportDpt } from "@/features/penduduk/application/dpt-use-cases";
import { listDptParamsSchema } from "@/features/penduduk/domain/dpt";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { hasPermission } from "@/features/rbac/application/authorization";
import { getCurrentUser } from "@/lib/dal";

export async function GET(request: Request, _context: RouteContext<"/penduduk/dpt/ekspor">) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Sesi Anda telah berakhir.", { status: 401 });
  }
  if (!hasPermission(user.permissions, PENDUDUK_RESOURCE, "read")) {
    return new Response("Anda tidak memiliki hak akses.", { status: 403 });
  }

  const url = new URL(request.url);
  const rawParams = {
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("perPage"),
    search: url.searchParams.get("search"),
    dusun: url.searchParams.get("dusun"),
    rw: url.searchParams.get("rw"),
    rt: url.searchParams.get("rt"),
    gender: url.searchParams.get("gender"),
    agamaId: url.searchParams.get("agamaId"),
    pendidikanId: url.searchParams.get("pendidikanId"),
    pekerjaanId: url.searchParams.get("pekerjaanId"),
    statusKawinId: url.searchParams.get("statusKawinId"),
    umurMin: url.searchParams.get("umurMin"),
    umurMax: url.searchParams.get("umurMax"),
  };

  const params = listDptParamsSchema.parse(rawParams);

  try {
    const { csv, filename } = await exportDpt(params);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Gagal membuat ekspor DPT:", error);
    return new Response("Gagal membuat ekspor DPT.", { status: 500 });
  }
}
