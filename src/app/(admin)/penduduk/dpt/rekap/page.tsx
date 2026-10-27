import { ArrowLeft, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRekapDpt } from "@/features/penduduk/application/dpt-use-cases";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Rekapitulasi DPT",
};

export default async function DptRekapPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PENDUDUK_RESOURCE, "read")) {
    return <NoAccess title="Rekapitulasi DPT" description="Rekap pemilih per wilayah desa." />;
  }

  const { rekap, election, namaDesa } = await getRekapDpt();

  // Tautan unduhan (route handler), bukan navigasi halaman.
  const eksporHref = "/penduduk/dpt/rekap/ekspor";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekapitulasi DPT"
        description="Jumlah pemilih tetap per wilayah beserta komposisi jenis kelamin."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/penduduk/dpt">
                <ArrowLeft className="size-4" />
                Daftar DPT
              </Link>
            </Button>
            {election ? (
              <Button variant="outline" asChild>
                <a href={eksporHref}>
                  <FileDown className="size-4" />
                  Ekspor CSV
                </a>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Rekapitulasi Daftar Pemilih Tetap</p>
        <p className="text-sm">{namaDesa ? `Desa ${namaDesa}` : "Desa"}</p>
        {election ? (
          <p className="text-sm">
            {election.judul} &mdash; {election.tanggal}
          </p>
        ) : null}
      </div>

      <Card>
        <CardContent className="space-y-4">
          {!election ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada pemilihan aktif, sehingga rekapitulasi belum tersedia.
            </p>
          ) : rekap.rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada pemilih yang memenuhi syarat pada pemilihan aktif.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead className="w-28 text-right">Laki-laki</TableHead>
                    <TableHead className="w-28 text-right">Perempuan</TableHead>
                    <TableHead className="w-24 text-right">Jumlah</TableHead>
                    <TableHead className="w-24 text-right">Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekap.rows.map((row, index) => (
                    <TableRow key={row.label}>
                      <TableCell className="tabular-nums">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.male}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.female}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.total}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Jumlah</TableCell>
                    <TableCell className="text-right tabular-nums">{rekap.male}</TableCell>
                    <TableCell className="text-right tabular-nums">{rekap.female}</TableCell>
                    <TableCell className="text-right tabular-nums">{rekap.total}</TableCell>
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
    </div>
  );
}
