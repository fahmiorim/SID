import { FileDown, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTanahKasData } from "@/features/bumindes/presentation/actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Buku Tanah Kas Desa" };

export default async function TanahKasPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Tanah Kas Desa" description="Buku Tanah Kas Desa." />;
  }
  const { items, mutasi } = await getTanahKasData();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Tanah Kas Desa (E1)"
        description="Persil tanah kas, rincian, dan riwayat mutasi."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/tanah-kas/cetak">
                <Printer className="size-4" />
                Cetak Buku
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/tanah-kas/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bumindes/tanah-kas/mutasi/cetak">
                <Printer className="size-4" />
                Cetak Mutasi
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/bumindes/tanah-kas/mutasi/ekspor">
                <FileDown className="size-4" />
                Ekspor Mutasi CSV
              </a>
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <p className="mb-2 font-medium">Daftar Persil Tanah Kas ({items.length})</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">No. Persil</th>
                  <th className="p-2 text-left">Asal</th>
                  <th className="p-2 text-left">Luas</th>
                  <th className="p-2 text-left">Lokasi</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b">
                    <td className="p-2">{it.nomorPersil}</td>
                    <td className="p-2">{it.asal ?? "-"}</td>
                    <td className="p-2">{it.luas}</td>
                    <td className="p-2">{it.lokasi ?? "-"}</td>
                    <td className="p-2">{it.status ?? "-"}</td>
                    <td className="p-2">{it.nilai}</td>
                  </tr>
                ))}
                {items.length === 0 ? (
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
          <p className="mb-2 font-medium">Riwayat Mutasi ({mutasi.length})</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Tanggal</th>
                  <th className="p-2 text-left">Jenis</th>
                  <th className="p-2 text-left">Uraian</th>
                  <th className="p-2 text-left">Perubahan Luas</th>
                  <th className="p-2 text-left">Perubahan Nilai</th>
                </tr>
              </thead>
              <tbody>
                {mutasi.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="p-2">{m.tanggal}</td>
                    <td className="p-2">{m.jenis}</td>
                    <td className="p-2">{m.uraian}</td>
                    <td className="p-2">{m.luasPerubahan ?? "-"}</td>
                    <td className="p-2">{m.nilaiPerubahan ?? "-"}</td>
                  </tr>
                ))}
                {mutasi.length === 0 ? (
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
