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
import { getLaporanKeuangan } from "@/features/keuangan/application/keuangan-use-cases";
import {
  AKUN_LAPORAN,
  formatRupiah,
  KEUANGAN_AKUN,
  KEUANGAN_RESOURCE,
} from "@/features/keuangan/domain/keuangan";
import { LaporanPrintButton } from "@/features/keuangan/presentation/components/laporan-print-button";
import { RpApbdChart } from "@/features/keuangan/presentation/components/rp-apbd-chart";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Laporan Keuangan",
};

function akunNama(kode: string): string {
  return KEUANGAN_AKUN.find((item) => item.kode === kode)?.nama ?? kode;
}

export default async function LaporanKeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KEUANGAN_RESOURCE, "read")) {
    return <NoAccess title="Laporan Keuangan" description="Laporan RP APBDes desa." />;
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const [laporan, desa] = await Promise.all([getLaporanKeuangan(tahunParam), getIdentitas()]);

  const tahunList = [...new Set([...laporan.tersedia, laporan.tahun])].sort((a, b) => a - b);
  const totalPersen =
    laporan.total.anggaran !== "0.00"
      ? (Number(laporan.total.realisasi) / Number(laporan.total.anggaran)) * 100
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Keuangan"
        description="RP APBDes dan realisasi per bidang (Siskeudes)."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/laporan?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors ${
                  item === laporan.tahun
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/40"
                }`}
              >
                {item}
              </Link>
            ))}
            <Button variant="outline" asChild>
              <a href={`/keuangan/laporan/ekspor?tahun=${laporan.tahun}`}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <LaporanPrintButton />
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Laporan Realisasi Pelaksanaan APBDes</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
        <p className="text-sm">Tahun Anggaran {laporan.tahun}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "anggaran", label: "Anggaran", value: formatRupiah(laporan.total.anggaran) },
          { key: "realisasi", label: "Realisasi", value: formatRupiah(laporan.total.realisasi) },
          { key: "selisih", label: "Selisih", value: formatRupiah(laporan.total.selisih) },
          { key: "persen", label: "% Realisasi", value: `${totalPersen.toFixed(2)}%` },
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
          <CardTitle className="text-base">RP APBDes — Tahun {laporan.tahun}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Kode</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead className="w-40 text-right">Anggaran</TableHead>
                <TableHead className="w-40 text-right">Realisasi</TableHead>
                <TableHead className="w-40 text-right">Selisih</TableHead>
                <TableHead className="w-24 text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.baris.map((row) => (
                <TableRow key={row.kode}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.kode}
                  </TableCell>
                  <TableCell className="font-medium">{row.uraian}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.anggaran)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.realisasi)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.selisih)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {row.persen.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Jumlah</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(laporan.total.anggaran)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(laporan.total.realisasi)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(laporan.total.selisih)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{totalPersen.toFixed(2)}%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <p className="mt-3 text-xs text-muted-foreground">
            Akun Aset, Kewajiban, Ekuitas, dan Non Anggaran tidak masuk laporan APBDes. Akun yang
            ditampilkan: {AKUN_LAPORAN.map(akunNama).join(", ")}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Realisasi Belanja per Bidang</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Kode</TableHead>
                <TableHead>Bidang</TableHead>
                <TableHead className="w-40 text-right">Anggaran</TableHead>
                <TableHead className="w-40 text-right">Realisasi</TableHead>
                <TableHead className="w-40 text-right">Selisih</TableHead>
                <TableHead className="w-24 text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.bidang.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-sm text-muted-foreground">
                    Belum ada bidang belanja pada tahun ini.
                  </TableCell>
                </TableRow>
              ) : (
                laporan.bidang.map((row) => (
                  <TableRow key={row.kode}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.kode}
                    </TableCell>
                    <TableCell className="font-medium">{row.uraian}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(row.anggaran)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(row.realisasi)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(row.selisih)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {row.persen.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {laporan.bidang.length > 0 ? (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Jumlah</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(laporan.totalBidang.anggaran)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(laporan.totalBidang.realisasi)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(laporan.totalBidang.selisih)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(
                      (Number(laporan.totalBidang.realisasi) /
                        (Number(laporan.totalBidang.anggaran) || 1)) *
                      100
                    ).toFixed(2)}
                    %
                  </TableCell>
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grafik RP APBDes</CardTitle>
        </CardHeader>
        <CardContent>
          <RpApbdChart seri={laporan.grafik} />
        </CardContent>
      </Card>
    </div>
  );
}
