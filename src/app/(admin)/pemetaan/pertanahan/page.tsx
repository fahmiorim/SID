import { ScrollText } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { listPersilUseCases } from "@/features/gis/application/use-cases";
import { PERTANAHAN_RESOURCE } from "@/features/gis/domain/gis";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pertanahan",
};

export default async function PertanahanPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PERTANAHAN_RESOURCE, "read")) {
    return (
      <NoAccess title="Pertanahan" description="Kelola data persil dan laporan pertanahan desa." />
    );
  }

  const persil = await listPersilUseCases();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pertanahan"
        description="Data persil tanah dan laporan pertanahan desa."
        actions={null}
      />

      <Card>
        <CardContent className="pt-6">
          {persil.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada data persil. Data akan muncul setelah impor atau input manual.
            </p>
          ) : (
            <div className="space-y-3">
              {persil.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <ScrollText className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">No. Persil: {p.nomor}</p>
                    <p className="text-sm text-muted-foreground">
                      Luas: {p.luas} m²
                      {p.status ? ` · Status: ${p.status}` : ""}
                    </p>
                  </div>
                  {p.keterangan && (
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {p.keterangan}
                    </span>
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
