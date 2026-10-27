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
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { getRekapDtksUseCase } from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE } from "@/features/penduduk/domain/dtks";
import type { DtksRekap, DtksRekapRow } from "@/features/penduduk/domain/dtks-berkas";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Laporan DTKS",
};

/** Tabel rekapitulasi DTKS dengan baris jumlah. */
function TabelRekap({
  judul,
  kolom,
  rows,
  rekap,
}: {
  judul: string;
  kolom: string;
  rows: DtksRekapRow[];
  rekap: DtksRekap;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{judul}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data DTKS.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{kolom}</TableHead>
                  <TableHead className="w-32 text-right">Jumlah DTKS</TableHead>
                  <TableHead className="w-28 text-right">Anggota</TableHead>
                  <TableHead className="w-24 text-right">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.jumlah}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.anggota}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Jumlah</TableCell>
                  <TableCell className="text-right tabular-nums">{rekap.total}</TableCell>
                  <TableCell className="text-right tabular-nums">{rekap.totalAnggota}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {rekap.total === 0 ? "0%" : "100%"}
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

export default async function LaporanDtksPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, DTKS_RESOURCE, "read")) {
    return <NoAccess title="Laporan DTKS" description="Rekap Data Terpadu Kesejahteraan Sosial." />;
  }

  const villageId = await resolveVillageId(user);
  const { rekap, namaDesa } = await getRekapDtksUseCase(villageId, { page: 1, perPage: 100000 });

  // Tautan unduhan (route handler), bukan navigasi halaman.
  const eksporHref = "/penduduk/dtks/laporan/ekspor";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan DTKS"
        description="Rekapitulasi formulir DTKS menurut status dan wilayah."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/penduduk/dtks">
                <ArrowLeft className="size-4" />
                Daftar DTKS
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
        <p className="text-lg font-bold uppercase">Rekapitulasi DTKS</p>
        <p className="text-sm">{namaDesa ? `Desa ${namaDesa}` : "Desa"}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:hidden">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Formulir DTKS</p>
            <p className="text-2xl font-semibold tabular-nums">{rekap.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Anggota tercatat</p>
            <p className="text-2xl font-semibold tabular-nums">{rekap.totalAnggota}</p>
          </CardContent>
        </Card>
      </div>

      <TabelRekap judul="Menurut Status" kolom="Status" rows={rekap.perStatus} rekap={rekap} />
      <TabelRekap judul="Menurut Dusun" kolom="Dusun" rows={rekap.perDusun} rekap={rekap} />
    </div>
  );
}
