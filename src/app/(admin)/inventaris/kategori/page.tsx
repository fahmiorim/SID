import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInventarisKategoriPageData } from "@/features/inventaris/application/inventaris-use-cases";
import { KategoriInventarisManager } from "@/features/inventaris/presentation/components/kategori-inventaris-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Kategori Inventaris" };

export default async function KategoriInventarisPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.inventaris, "read")) {
    return (
      <NoAccess
        title="Kategori Inventaris"
        description="Anda tidak memiliki akses untuk melihat kategori inventaris."
      />
    );
  }

  const data = await getInventarisKategoriPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Inventaris"
        description="Kelompokkan aset berdasarkan golongan barang."
        actions={
          <Button variant="outline" asChild>
            <Link href="/inventaris">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent>
          <KategoriInventarisManager {...data} />
        </CardContent>
      </Card>
    </div>
  );
}
