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
import { getRekapSuplemenUseCase } from "@/features/penduduk/application/suplemen-use-cases";
import { SUPLEMEN_RESOURCE } from "@/features/penduduk/domain/suplemen";
import { LaporanPrintButton } from "@/features/penduduk/presentation/components/laporan-print-button";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Laporan Data Suplemen",
};

export default async function LaporanSuplemenPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SUPLEMEN_RESOURCE, "read")) {
    return (
      <NoAccess title="Laporan Data Suplemen" description="Rekapitulasi data suplemen desa." />
    );
  }

  const villageId = await resolveVillageId(user);
  const { rekap, namaDesa } = await getRekapSuplemenUseCase(villageId);

  // Tautan unduhan (route handler), bukan navigasi halaman.
  const eksporHref = "/penduduk/suplemen/laporan/ekspor";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Data Suplemen"
        description="Rekapitulasi jumlah terdata pada setiap suplemen."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/penduduk/suplemen">
                <ArrowLeft className="size-4" />
                Daftar Suplemen
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={eksporHref}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <LaporanPrintButton />
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Rekapitulasi Data Suplemen</p>
        <p className="text-sm">{namaDesa ? `Desa ${namaDesa}` : "Desa"}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:hidden">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Jumlah suplemen</p>
            <p className="text-2xl font-semibold tabular-nums">{rekap.totalSuplemen}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Jumlah terdata</p>
            <p className="text-2xl font-semibold tabular-nums">{rekap.totalTerdata}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi per Suplemen</CardTitle>
        </CardHeader>
        <CardContent>
          {rekap.rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada suplemen yang dibuat.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Suplemen</TableHead>
                    <TableHead className="w-40">Sasaran</TableHead>
                    <TableHead className="w-32 text-right">Terdata</TableHead>
                    <TableHead className="w-28 text-right">Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekap.rows.map((row) => (
                    <TableRow key={row.nama}>
                      <TableCell className="font-medium">{row.nama}</TableCell>
                      <TableCell>{row.sasaran}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.jumlahTerdata}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>{rekap.totalSuplemen} suplemen</TableCell>
                    <TableCell className="text-right tabular-nums">{rekap.totalTerdata}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {rekap.totalTerdata === 0 ? "0%" : "100%"}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
