import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listWilayah } from "@/features/wilayah/application/use-cases";

export const metadata: Metadata = {
  title: "Rekap Wilayah",
};

export default async function WilayahRekapPage() {
  const result = await listWilayah({ search: "", page: 1, pageSize: 1000 });
  const dusun = [...new Set(result.rows.map((r) => r.dusun).filter(Boolean))];
  const rw = [...new Set(result.rows.map((r) => r.rw).filter(Boolean))];
  const rt = [...new Set(result.rows.map((r) => r.rt).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Wilayah Administratif"
        description="Hierarki dusun, RW, dan RT"
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              Cetak
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/wilayah">Kembali</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Jumlah Dusun</p>
            <p className="text-2xl font-semibold">{dusun.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Jumlah RW</p>
            <p className="text-2xl font-semibold">{rw.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Jumlah RT</p>
            <p className="text-2xl font-semibold">{rt.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dusun</TableHead>
                <TableHead>RW</TableHead>
                <TableHead>RT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.dusun || "-"}</TableCell>
                  <TableCell>{row.rw || "-"}</TableCell>
                  <TableCell>{row.rt || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

<Card>
  <CardContent className="p-4">
    <h3 className="mb-2 font-semibold">Rekap Penduduk per Wilayah</h3>
    <p className="text-sm text-muted-foreground">
      Data rekap penduduk per dusun/RW/RT tersedia melalui modul Kependudukan.
    </p>
    <Button asChild variant="outline" size="sm" className="mt-2">
      <Link href="/penduduk">Lihat Data Penduduk</Link>
    </Button>
  </CardContent>
</Card>;
