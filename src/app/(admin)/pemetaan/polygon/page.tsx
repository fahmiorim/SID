import { Map as MapIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listPolygonUseCases } from "@/features/gis/application/use-cases";
import { POLYGON_RESOURCE } from "@/features/gis/domain/gis";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Kategori Peta",
};

export default async function PolygonPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, POLYGON_RESOURCE, "read")) {
    return <NoAccess title="Kategori Peta" description="Kelola kategori/layer peta desa." />;
  }

  const polygons = await listPolygonUseCases();
  const canManage = hasPermission(user.permissions, POLYGON_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Peta"
        description="Kelola kategori atau layer peta desa (polygon utama dan sub-polygon)."
        actions={
          canManage ? (
            <Link href="/pemetaan/polygon/form">
              <Button>
                <MapIcon className="mr-2 size-4" />
                Tambah Polygon
              </Button>
            </Link>
          ) : null
        }
      />

      <Card>
        <CardContent className="pt-6">
          {polygons.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada kategori peta. Klik &quot;Tambah Polygon&quot; untuk membuat kategori
              pertama.
            </p>
          ) : (
            <div className="space-y-3">
              {polygons.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div
                    className="size-8 rounded"
                    style={{ backgroundColor: p.color ?? "#94a3b8" }}
                    aria-label={`Warna: ${p.color ?? "tidak diatur"}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{p.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.tipe === 0 ? "Root / Layer Utama" : "Sub-Polygon"} ·
                      {p.sortOrder !== 0 ? ` Urutan ${p.sortOrder}` : ""}
                    </p>
                  </div>
                  {p.simbol && (
                    <span className="text-sm text-muted-foreground">Simbol: {p.simbol}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
