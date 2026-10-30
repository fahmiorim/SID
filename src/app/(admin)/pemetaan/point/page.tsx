import { Crosshair } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { listPointUseCases } from "@/features/gis/application/use-cases";
import { POINT_RESOURCE } from "@/features/gis/domain/gis";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Titik Peta",
};

export default async function PointPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, POINT_RESOURCE, "read")) {
    return <NoAccess title="Titik Peta" description="Kelola titik-titik penting pada peta desa." />;
  }

  const points = await listPointUseCases();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Titik Peta"
        description="Titik-titik penting pada peta desa."
        actions={null}
      />

      <Card>
        <CardContent className="pt-6">
          {points.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Belum ada titik peta.</p>
          ) : (
            <div className="space-y-3">
              {points.map((p) => {
                let coords: [number, number] | null = null;
                if (p.path) {
                  try {
                    const parsed = JSON.parse(p.path);
                    if (parsed?.type === "Point" && Array.isArray(parsed.coordinates)) {
                      coords = parsed.coordinates as [number, number];
                    }
                  } catch {
                    // ignore
                  }
                }
                return (
                  <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <Crosshair className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{p.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {coords
                          ? `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
                          : "Tanpa koordinat"}
                        {p.parrent ? ` · Layer ${p.parrent}` : ""}
                      </p>
                    </div>
                    {p.simbol && (
                      <span className="text-xs text-muted-foreground">Simbol: {p.simbol}</span>
                    )}
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
