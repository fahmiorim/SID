import { ArrowLeft, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { getLaporanRumahTangga } from "@/features/rumah-tangga/application/use-cases";
import {
  filterRtmKeSearchParams,
  parseFilterRtm,
  RUMAH_TANGGA_RESOURCE,
  type RtmRekap,
  type RtmRekapRow,
} from "@/features/rumah-tangga/domain/rumah-tangga";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Laporan Rumah Tangga",
};

/** Tabel rekapitulasi RTM dengan baris jumlah di bawah. */
function TabelRekap({
  judul,
  kolom,
  rows,
  rekap,
}: {
  judul: string;
  kolom: string;
  rows: RtmRekapRow[];
  rekap: RtmRekap;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{judul}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada data rumah tangga yang cocok.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{kolom}</TableHead>
                  <TableHead className="w-28 text-right">Jumlah RTM</TableHead>
                  <TableHead className="w-28 text-right">Anggota</TableHead>
                  <TableHead className="w-24 text-right">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.jumlahRtm}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.jumlahAnggota}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Jumlah</TableCell>
                  <TableCell className="text-right tabular-nums">{rekap.totalRtm}</TableCell>
                  <TableCell className="text-right tabular-nums">{rekap.totalAnggota}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {rekap.totalRtm === 0 ? "0%" : "100%"}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function LaporanRumahTanggaPage({
  searchParams,
}: PageProps<"/rumah-tangga/laporan">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RUMAH_TANGGA_RESOURCE, "read")) {
    return <NoAccess title="Laporan Rumah Tangga" description="Rekap RTM per kelas sosial." />;
  }

  const params = await searchParams;
  const filter = parseFilterRtm(params as Record<string, string | string[] | undefined>);
  const { rekap, namaDesa } = await getLaporanRumahTangga(filter);
  const eksporHref = `/rumah-tangga/laporan/ekspor?${filterRtmKeSearchParams(filter).toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Rumah Tangga"
        description="Rekapitulasi rumah tangga menurut kelas sosial dan wilayah."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/rumah-tangga">
                <ArrowLeft className="size-4" />
                Daftar RTM
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={eksporHref}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Laporan Rumah Tangga</p>
        <p className="text-sm">{namaDesa ? `Desa ${namaDesa}` : "Desa"}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:hidden">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total rumah tangga</p>
            <p className="text-2xl font-semibold tabular-nums">{rekap.totalRtm}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total anggota</p>
            <p className="text-2xl font-semibold tabular-nums">{rekap.totalAnggota}</p>
          </CardContent>
        </Card>
      </div>

      <TabelRekap
        judul="Menurut Kelas Sosial"
        kolom="Kelas Sosial"
        rows={rekap.perKelasSosial}
        rekap={rekap}
      />
      <TabelRekap judul="Menurut Dusun" kolom="Dusun" rows={rekap.perDusun} rekap={rekap} />
    </div>
  );
}
