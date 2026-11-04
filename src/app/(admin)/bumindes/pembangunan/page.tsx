import { FileDown, Printer } from "lucide-react";
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

export const metadata: Metadata = { title: "Buku Pembangunan" };

export default async function PembangunanPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Pembangunan" description="Buku Pembangunan Desa." />;
  }
  const { pembangunan, kader } = await getPembangunanData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Pembangunan"
        description="Rencana, kegiatan, pelaksanaan, hasil pembangunan dan kader."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/pembangunan/cetak">
                <Printer className="size-4" />
                Cetak Buku
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/pembangunan/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/pembangunan/kader">Buku Kader</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/pembangunan/kader/cetak">
                <Printer className="size-4" />
                Cetak Kader
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/pembangunan/kader/ekspor">
                <FileDown className="size-4" />
                Ekspor Kader CSV
              </a>
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <p className="mb-2 font-medium">Daftar Pembangunan ({pembangunan.length})</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Tahun</th>
                  <th className="p-2 text-left">Nama Kegiatan</th>
                  <th className="p-2 text-left">Lokasi</th>
                  <th className="p-2 text-left">Sumber Dana</th>
                  <th className="p-2 text-left">Biaya</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pembangunan.map((it) => (
                  <tr key={it.id} className="border-b">
                    <td className="p-2">{it.tahun}</td>
                    <td className="p-2">{it.namaKegiatan}</td>
                    <td className="p-2">{it.lokasi ?? "-"}</td>
                    <td className="p-2">{it.sumberDana ?? "-"}</td>
                    <td className="p-2">{it.biaya}</td>
                    <td className="p-2">{it.status}</td>
                  </tr>
                ))}
                {pembangunan.length === 0 ? (
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
      <Card>
        <CardContent className="pt-6">
          <p className="mb-2 font-medium">Kader Pembangunan ({kader.length})</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Jabatan</th>
                  <th className="p-2 text-left">Bidang</th>
                  <th className="p-2 text-left">No. HP</th>
                </tr>
              </thead>
              <tbody>
                {kader.map((k) => (
                  <tr key={k.id} className="border-b">
                    <td className="p-2">{k.nama}</td>
                    <td className="p-2">{k.jabatan ?? "-"}</td>
                    <td className="p-2">{k.bidang ?? "-"}</td>
                    <td className="p-2">{k.noHp ?? "-"}</td>
                  </tr>
                ))}
                {kader.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
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
