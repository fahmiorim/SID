import { ArrowLeftRight, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getInventarisPageData } from "@/features/inventaris/application/inventaris-use-cases";
import { InventarisManager } from "@/features/inventaris/presentation/components/inventaris-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Inventaris & Aset" };

export default async function InventarisPage({ searchParams }: PageProps<"/inventaris">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.inventaris, "read")) {
    return (
      <NoAccess
        title="Inventaris & Aset"
        description="Anda tidak memiliki akses untuk melihat data inventaris desa."
      />
    );
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const data = await getInventarisPageData(search);
  const canSeeKategori = hasPermission(user.permissions, RESOURCES.inventaris, "read");
  const canSeeMutasi = hasPermission(user.permissions, RESOURCES.mutasiInventaris, "read");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris & Aset"
        description="Kelola barang/aset desa, nilai, kondisi, dan lokasi penyimpanannya."
        actions={
          <div className="flex flex-wrap gap-2">
            {canSeeKategori ? (
              <Button variant="outline" asChild>
                <Link href="/inventaris/kategori">
                  <Tags className="size-4" />
                  Kategori
                </Link>
              </Button>
            ) : null}
            {canSeeMutasi ? (
              <Button variant="outline" asChild>
                <Link href="/inventaris/mutasi">
                  <ArrowLeftRight className="size-4" />
                  Mutasi
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              defaultValue={search}
              placeholder="Cari nama/nomor/kode barang..."
              className="flex-1 sm:max-w-sm"
            />
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search ? (
              <Button variant="ghost" asChild>
                <Link href="/inventaris">Reset</Link>
              </Button>
            ) : null}
          </form>

          <InventarisManager {...data} />
        </CardContent>
      </Card>
    </div>
  );
}
