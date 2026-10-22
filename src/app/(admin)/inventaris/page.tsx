import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getInventarisPageData } from "@/features/inventaris/application/inventaris-use-cases";

export const metadata: Metadata = { title: "Inventaris & Aset" };

export default async function InventarisPage({ searchParams }: PageProps<"/inventaris">) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const { rows, total } = await getInventarisPageData(search);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris & Aset"
        description="Data barang/aset desa (sesuai alur OpenSID)."
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
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Nomor Inventaris</th>
                  <th className="p-2 text-left">Nama Barang</th>
                  <th className="p-2 text-left">Kategori</th>
                  <th className="p-2 text-left">Merk/Tipe</th>
                  <th className="p-2 text-left">Jumlah</th>
                  <th className="p-2 text-left">Kondisi</th>
                  <th className="p-2 text-left">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-28 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Boxes className="size-5" />
                        <p>Belum ada data inventaris.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.nomorInventaris || "-"}</td>
                      <td className="p-2">{r.namaBarang}</td>
                      <td className="p-2">{r.kategoriNama || "-"}</td>
                      <td className="p-2">{[r.merk, r.tipe].filter(Boolean).join(" / ") || "-"}</td>
                      <td className="p-2">
                        {r.jumlah} {r.satuan}
                      </td>
                      <td className="p-2 capitalize">{r.kondisi?.replace("_", " ")}</td>
                      <td className="p-2">{r.lokasi || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Menampilkan {rows.length} dari {total} data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
