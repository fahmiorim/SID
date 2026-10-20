import { FileDown } from "lucide-react";
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
import { getIdentitas } from "@/features/desa/application/get-identitas";
import {
  getLaporanPenduduk,
  normalisasiJenis,
} from "@/features/penduduk/application/laporan-penduduk-use-cases";
import {
  LAPORAN_PENDUDUK_OPTIONS,
  laporanPendudukKategori,
} from "@/features/penduduk/domain/laporan-penduduk";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { LaporanPrintButton } from "@/features/penduduk/presentation/components/laporan-print-button";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Laporan Kependudukan",
};

export default async function LaporanPendudukPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PENDUDUK_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Laporan Kependudukan"
        description="Statistik dan rekap data penduduk desa."
      />
    );
  }

  const params = await searchParams;
  const jenis = normalisasiJenis(params.jenis);
  const [laporan, desa] = await Promise.all([getLaporanPenduduk(jenis), getIdentitas()]);

  const { statistik } = laporan;
  const persen = (jumlah: number): string =>
    statistik.total.jumlah > 0
      ? `${((jumlah / statistik.total.jumlah) * 100).toFixed(2)}%`
      : "0.00%";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Kependudukan"
        description="Rekap penduduk berstatus hidup menurut kategori."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <a href={`/penduduk/laporan/ekspor?jenis=${jenis}`}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <LaporanPrintButton />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {LAPORAN_PENDUDUK_OPTIONS.map((item) => (
          <Link
            key={item.value}
            href={`/penduduk/laporan?jenis=${item.value}`}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              item.value === jenis ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">
          Laporan Data Statistik Kependudukan Menurut {laporanPendudukKategori(jenis)}
        </p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { key: "total", label: "Total Penduduk", value: statistik.total.jumlah },
          { key: "laki", label: "Laki-laki", value: statistik.total.lakiLaki },
          { key: "perempuan", label: "Perempuan", value: statistik.total.perempuan },
        ].map((item) => (
          <Card key={item.key}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Sebaran Menurut {laporanPendudukKategori(jenis)}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="w-28 text-right">Laki-laki</TableHead>
                <TableHead className="w-28 text-right">Perempuan</TableHead>
                <TableHead className="w-28 text-right">Jumlah</TableHead>
                <TableHead className="w-24 text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistik.baris.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    Belum ada data penduduk untuk ditampilkan.
                  </TableCell>
                </TableRow>
              ) : (
                statistik.baris.map((row, index) => (
                  <TableRow key={row.label}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.lakiLaki}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.perempuan}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {row.jumlah}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {persen(row.jumlah)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Jumlah</TableCell>
                <TableCell className="text-right tabular-nums">
                  {statistik.total.lakiLaki}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {statistik.total.perempuan}
                </TableCell>
                <TableCell className="text-right tabular-nums">{statistik.total.jumlah}</TableCell>
                <TableCell className="text-right tabular-nums">100.00%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {statistik.total.tanpaKategori > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {statistik.total.tanpaKategori} penduduk tidak punya data kategori ini sehingga tidak
              masuk hitungan sebaran (tetap dihitung pada total).
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
