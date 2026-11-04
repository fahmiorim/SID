import { ArrowLeft, FileDown, Printer } from "lucide-react";
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

export const metadata: Metadata = { title: "Peraturan Desa & Keputusan Kades" };

export default async function PeraturanPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Peraturan" description="Buku Peraturan Desa." />;
  }
  const { peraturan } = await getSekretariatData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Peraturan Desa dan Keputusan Kepala Desa"
        description="Rekam peraturan desa dan keputusan kades."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/peraturan/cetak">
                <Printer className="size-4" />
                Cetak
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/sekretariat/peraturan/ekspor">
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
                  <th className="p-2 text-left">Jenis</th>
                  <th className="p-2 text-left">Nomor</th>
                  <th className="p-2 text-left">Tahun</th>
                  <th className="p-2 text-left">Tentang</th>
                  <th className="p-2 text-left">Tgl Ditetapkan</th>
                  <th className="p-2 text-left">Tgl Diundangkan</th>
                </tr>
              </thead>
              <tbody>
                {peraturan.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">
                      {p.jenis === "keputusan_kades" ? "Keputusan Kades" : "Peraturan Desa"}
                    </td>
                    <td className="p-2">{p.nomor}</td>
                    <td className="p-2">{p.tahun ?? "-"}</td>
                    <td className="p-2">{p.tentang}</td>
                    <td className="p-2">{p.tanggalDitetapkan ?? "-"}</td>
                    <td className="p-2">{p.tanggalDiundangkan ?? "-"}</td>
                  </tr>
                ))}
                {peraturan.length === 0 ? (
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
