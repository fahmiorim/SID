import { Map as MapIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { listGarisUseCases } from "@/features/gis/application/use-cases";
import { GARIS_RESOURCE } from "@/features/gis/domain/gis";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Garis Peta",
};

export default async function GarisPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, GARIS_RESOURCE, "read")) {
    return <NoAccess title="Garis Peta" description="Kelola garis/batas peta desa." />;
  }

  const garis = await listGarisUseCases();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garis Peta"
        description="Garis/batas peta desa (GeoJSON LineString)."
        actions={null}
      />

      <Card>
        <CardContent className="pt-6">
          {garis.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Belum ada garis peta.</p>
          ) : (
            <div className="space-y-3">
              {garis.map((g) => {
                const segments = g.path
                  ? (() => {
                      try {
                        const parsed = JSON.parse(g.path);
                        if (parsed?.type === "LineString" && Array.isArray(parsed.coordinates)) {
                          return parsed.coordinates.length;
                        }
                      } catch {
                        // ignore
                      }
                      return 0;
                    })()
                  : 0;
                return (
                  <div key={g.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <MapIcon className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{g.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {segments > 0 ? `${segments} segmen` : "Tanpa path"}
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
