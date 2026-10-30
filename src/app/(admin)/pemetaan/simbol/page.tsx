import { CircleDot } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { listSimbolUseCases } from "@/features/gis/application/use-cases";
import { SIMBOL_RESOURCE } from "@/features/gis/domain/gis";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Simbol Peta",
};

export default async function SimbolPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SIMBOL_RESOURCE, "read")) {
    return <NoAccess title="Simbol Peta" description="Kelola katalog simbol/ikon peta desa." />;
  }

  const simbols = await listSimbolUseCases();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simbol Peta"
        description="Katalog simbol/ikon yang digunakan pada layer peta."
        actions={null}
      />

      <Card>
        <CardContent className="pt-6">
          {simbols.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Belum ada simbol peta.</p>
          ) : (
            <div className="space-y-3">
              {simbols.map((s) => (
                <div key={s.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <CircleDot className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{s.simbol}</p>
                    {s.desk && <p className="text-sm text-muted-foreground">{s.desk}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">Urut: {s.sortOrder}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
