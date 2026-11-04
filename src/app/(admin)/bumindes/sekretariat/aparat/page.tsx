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

export const metadata: Metadata = { title: "Data Aparat Pemerintah Desa" };

export default async function AparatPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Aparat" description="Buku Data Aparat." />;
  }
  const { aparat } = await getSekretariatData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Data Aparat Pemerintah Desa"
        description="Daftar perangkat desa dan jabatan."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/aparat/cetak">
                <Printer className="size-4" />
                Cetak
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/sekretariat/aparat/ekspor">
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
                  <th className="p-2 text-left">NIP</th>
                  <th className="p-2 text-left">Jabatan</th>
                  <th className="p-2 text-left">Pendidikan</th>
                  <th className="p-2 text-left">Tgl Pengangkatan</th>
                </tr>
              </thead>
              <tbody>
                {aparat.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2">{a.nama}</td>
                    <td className="p-2">{a.nip ?? "-"}</td>
                    <td className="p-2">{a.jabatan}</td>
                    <td className="p-2">{a.pendidikan ?? "-"}</td>
                    <td className="p-2">{a.tanggalPengangkatan ?? "-"}</td>
                  </tr>
                ))}
                {aparat.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
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
