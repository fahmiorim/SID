import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { daftarSinergi } from "@/features/sinergi/application/sinergi-use-cases";
import { buatCsvSinergi, SINERGI_RESOURCE } from "@/features/sinergi/domain/sinergi";
import { verifySession } from "@/lib/dal";

export async function GET(_request: Request) {
  const user = await verifySession();
  if (!user) {
    return new Response("Sesi Anda telah berakhir.", { status: 401 });
  }
  if (!hasPermission(user.permissions, SINERGI_RESOURCE, "read")) {
    return new Response("Anda tidak memiliki hak akses.", { status: 403 });
  }

  try {
    const villageId = await resolveVillageId(user);
    const rows = await daftarSinergi(villageId);
    const tanggal = new Date().toISOString().slice(0, 10);

    return new Response(buatCsvSinergi(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sinergi-program-${tanggal}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Gagal membuat ekspor sinergi:", error);
    return new Response("Gagal membuat ekspor sinergi.", { status: 500 });
  }
}
