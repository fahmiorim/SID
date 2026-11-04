import { ArrowLeft, FileDown, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPembangunanData } from "@/features/bumindes/presentation/actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Buku Kader Pembangunan" };

export default async function KaderPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Kader Pembangunan" description="Buku Kader Pembangunan." />;
  }
  const { kader } = await getPembangunanData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Kader Pembangunan"
        description="Data kader pemberdayaan/pembangunan desa."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/pembangunan">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/pembangunan/kader/cetak">
                <Printer className="size-4" />
                Cetak
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/pembangunan/kader/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Jabatan</th>
                  <th className="p-2 text-left">Bidang</th>
                  <th className="p-2 text-left">Alamat</th>
                  <th className="p-2 text-left">No. HP</th>
                  <th className="p-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {kader.map((k) => (
                  <tr key={k.id} className="border-b">
                    <td className="p-2">{k.nama}</td>
                    <td className="p-2">{k.jabatan ?? "-"}</td>
                    <td className="p-2">{k.bidang ?? "-"}</td>
                    <td className="p-2">{k.alamat ?? "-"}</td>
                    <td className="p-2">{k.noHp ?? "-"}</td>
                    <td className="p-2">{k.keterangan ?? "-"}</td>
                  </tr>
                ))}
                {kader.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      Belum ada data.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
