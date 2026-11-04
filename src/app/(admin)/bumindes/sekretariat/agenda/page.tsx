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

export const metadata: Metadata = { title: "Buku Agenda & Ekspedisi" };

export default async function AgendaPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Agenda" description="Buku Agenda & Ekspedisi." />;
  }
  const { agenda } = await getSekretariatData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Agenda dan Ekspedisi"
        description="Surat masuk dan surat keluar."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/agenda/cetak">
                <Printer className="size-4" />
                Cetak Agenda
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/sekretariat/agenda/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/sekretariat/agenda/cetak?jenis=keluar">
                <Printer className="size-4" />
                Cetak Ekspedisi
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/sekretariat/agenda/ekspor?jenis=keluar">
                <FileDown className="size-4" />
                Ekspor Ekspedisi CSV
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
                  <th className="p-2 text-left">Tanggal</th>
                  <th className="p-2 text-left">Nomor Surat</th>
                  <th className="p-2 text-left">Asal/Tujuan</th>
                  <th className="p-2 text-left">Perihal</th>
                </tr>
              </thead>
              <tbody>
                {agenda.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2">{a.jenis === "keluar" ? "Surat Keluar" : "Surat Masuk"}</td>
                    <td className="p-2">{a.tanggal}</td>
                    <td className="p-2">{a.nomorSurat ?? "-"}</td>
                    <td className="p-2">{a.asalTujuan ?? "-"}</td>
                    <td className="p-2">{a.perihal}</td>
                  </tr>
                ))}
                {agenda.length === 0 ? (
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
