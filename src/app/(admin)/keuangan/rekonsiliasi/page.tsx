import { ArrowLeft, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getRekonsiliasiKeuangan } from "@/features/keuangan/application/keuangan-use-cases";
import { formatRupiah, KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import { LaporanPrintButton } from "@/features/keuangan/presentation/components/laporan-print-button";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Rekonsiliasi Realisasi APBDes" };

export default async function RekonsiliasiPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KEUANGAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Rekonsiliasi Realisasi"
        description="Bandingkan realisasi tahunan dengan laporan triwulan."
      />
    );
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const [{ tahun, tersedia, baris, total }, desa] = await Promise.all([
    getRekonsiliasiKeuangan(tahunParam),
    getIdentitas(),
  ]);
  const tahunList = [...new Set([...tersedia, tahun])].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekonsiliasi Realisasi"
        description="Membandingkan realisasi tahunan APBDes dengan jumlah realisasi triwulan per bidang."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/rekonsiliasi?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors ${
                  item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"
                }`}
              >
                {item}
              </Link>
            ))}
            <LaporanPrintButton />
            <Button variant="outline" asChild>
              <Link href="/keuangan/laporan">
                <ArrowLeft className="size-4" />
                Kembali ke Laporan
              </Link>
            </Button>
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Rekonsiliasi Realisasi APBDes</p>
        <p className="text-sm">
          {desa?.namaDesa ?? "Desa"} · Tahun Anggaran {tahun}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Realisasi tahunan</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatRupiah(total.realisasiTahunan)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Jumlah triwulan</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatRupiah(total.realisasiTriwulan)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Selisih (triwulan − tahunan)</p>
            <p
              className={`text-lg font-semibold tabular-nums ${
                total.selisih === "0.00" ? "" : "text-destructive"
              }`}
            >
              {formatRupiah(total.selisih)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Scale className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status bidang</p>
              <div className="flex flex-wrap gap-1 pt-1">
                <Badge variant="secondary">{total.jumlahCocok} cocok</Badge>
                {total.jumlahBeda > 0 ? (
                  <Badge variant="destructive">{total.jumlahBeda} selisih</Badge>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rincian per Bidang Belanja</CardTitle>
          <CardDescription>
            Realisasi tahunan berasal dari APBDes; kolom triwulan adalah penjumlahan TW I–IV yang
            diisi pada halaman Laporan Triwulan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {baris.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada data bidang belanja untuk tahun {tahun}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Bidang</TableHead>
                    <TableHead className="text-right">Pagu</TableHead>
                    <TableHead className="text-right">Realisasi Tahunan</TableHead>
                    <TableHead className="text-right">Jumlah Triwulan</TableHead>
                    <TableHead className="text-right">Selisih</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baris.map((item) => (
                    <TableRow key={item.kode}>
                      <TableCell className="font-mono text-xs">{item.kode}</TableCell>
                      <TableCell className="min-w-56">{item.uraian}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(item.anggaran)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(item.realisasiTahunan)}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({item.persenTahunan}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(item.realisasiTriwulan)}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({item.persenTriwulan}%)
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          item.cocok ? "" : "font-medium text-destructive"
                        }`}
                      >
                        {formatRupiah(item.selisih)}
                      </TableCell>
                      <TableCell>
                        {item.cocok ? (
                          <Badge variant="secondary">Cocok</Badge>
                        ) : (
                          <Badge variant="destructive">Perlu dicek</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Jumlah</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.anggaran)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.realisasiTahunan)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.realisasiTriwulan)}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        total.selisih === "0.00" ? "" : "font-medium text-destructive"
                      }`}
                    >
                      {formatRupiah(total.selisih)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground print:hidden">
        Selisih berarti realisasi tahunan dan jumlah triwulan belum sinkron. Periksa{" "}
        <Link className="underline" href={`/keuangan/anggaran?tahun=${tahun}`}>
          APBDes
        </Link>{" "}
        dan{" "}
        <Link className="underline" href={`/keuangan/triwulan?tahun=${tahun}`}>
          Laporan Triwulan
        </Link>{" "}
        untuk memperbaikinya. Rekonsiliasi ini membandingkan data internal; saldo rekening koran
        bank belum dicatat aplikasi.
      </p>
    </div>
  );
}
