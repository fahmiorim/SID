import { FileDown, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSekretariatData } from "@/features/bumindes/presentation/actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Buku Sekretariat" };

export default async function SekretariatPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Sekretariat" description="Buku Sekretariat Desa." />;
  }
  const { peraturan, aparat, agenda } = await getSekretariatData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Sekretariat Desa"
        description="Peraturan Desa/Keputusan Kades, Aparat, Agenda dan Ekspedisi."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/peraturan">Peraturan & Keputusan</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/aparat">Data Aparat</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/agenda">Agenda Surat</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Peraturan Desa / Keputusan Kades</p>
            <p className="text-sm text-muted-foreground">{peraturan.length} data</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/bumindes/sekretariat/peraturan/cetak">
                  <Printer className="size-4" />
                  Cetak
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="/bumindes/sekretariat/peraturan/ekspor">
                  <FileDown className="size-4" />
                  Ekspor
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Data Aparat Pemerintah Desa</p>
            <p className="text-sm text-muted-foreground">{aparat.length} data</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/bumindes/sekretariat/aparat/cetak">
                  <Printer className="size-4" />
                  Cetak
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="/bumindes/sekretariat/aparat/ekspor">
                  <FileDown className="size-4" />
                  Ekspor
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Agenda / Ekspedisi</p>
            <p className="text-sm text-muted-foreground">{agenda.length} data</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/bumindes/sekretariat/agenda/cetak">
                  <Printer className="size-4" />
                  Cetak Agenda
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="/bumindes/sekretariat/agenda/ekspor">
                  <FileDown className="size-4" />
                  Ekspor
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
