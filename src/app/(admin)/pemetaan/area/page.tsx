import { MapPin } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { listAreaUseCases } from "@/features/gis/application/use-cases";
import { AREA_RESOURCE } from "@/features/gis/domain/gis";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Area Peta",
};

export default async function AreaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, AREA_RESOURCE, "read")) {
    return <NoAccess title="Area Peta" description="Kelola area peta desa berdasarkan polygon." />;
  }

  const areas = await listAreaUseCases();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Area Peta"
        description="Area/wilayah peta yang merujuk ke kategori polygon."
        actions={null}
      />

      <Card>
        <CardContent className="pt-6">
          {areas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada area peta. Area akan muncul setelah polygon dibuat.
            </p>
          ) : (
            <div className="space-y-3">
              {areas.map((a) => {
                const points = a.path
                  ? (() => {
                      try {
                        const parsed = JSON.parse(a.path);
                        if (parsed?.type === "Polygon" && Array.isArray(parsed.coordinates[0])) {
                          return parsed.coordinates[0].length;
                        }
                      } catch {
                        // ignore
                      }
                      return 0;
                    })()
                  : 0;
                return (
                  <div key={a.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <MapPin className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{a.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        Ref Polygon: {a.refPolygon ?? "-"} · {points} titik path
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
