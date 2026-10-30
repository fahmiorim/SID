import { FileDown } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { listRentangUmurUseCase } from "@/features/statistik/application/rentang-umur-use-cases";
import {
  RENTANG_UMUR_RESOURCE,
  type RentangUmurDTO,
} from "@/features/statistik/domain/rentang-umur";
import { RentangUmurTable } from "@/features/statistik/presentation/components/rentang-umur-table";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Rentang Umur",
};

export default async function RentangUmurPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RENTANG_UMUR_RESOURCE, "read")) {
    return (
      <NoAccess title="Rentang Umur" description="Pengaturan rentang umur statistik penduduk." />
    );
  }

  const canManage = hasPermission(user.permissions, RENTANG_UMUR_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows: RentangUmurDTO[] = await listRentangUmurUseCase({ villageId });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rentang Umur"
        description="Pengaturan bucket umur dinamis untuk statistik penduduk."
        actions={
          canManage ? (
            <Button variant="outline" asChild>
              <a href="/statistik/rentang-umur/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="pt-6">
          <RentangUmurTable canManage={canManage} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
