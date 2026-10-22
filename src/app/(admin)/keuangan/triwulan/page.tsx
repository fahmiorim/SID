import { FileDown, Table2 } from "lucide-react";
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
import { getLaporanTriwulan } from "@/features/keuangan/application/keuangan-use-cases";
import { formatRupiah, KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import { TriwulanInputTable } from "@/features/keuangan/presentation/components/triwulan-input-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Laporan Triwulan APBDes" };

export default async function LaporanTriwulanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KEUANGAN_RESOURCE, "read")) {
    return (
      <NoAccess title="Laporan Triwulan" description="Laporan realisasi per triwulan APBDes." />
    );
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const [laporan, desa] = await Promise.all([getLaporanTriwulan(tahunParam), getIdentitas()]);
  const { tahun, tersedia, baris, total } = laporan;
  const canManage = hasPermission(user.permissions, KEUANGAN_RESOURCE, "update");
  const tahunList = [...new Set([...tersedia, tahun])].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Triwulan APBDes"
        description="Realisasi belanja per bidang per triwulan."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/triwulan?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums ${item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"}`}
              >
                {item}
              </Link>
            ))}
            <Button variant="outline" asChild>
              <Link href="/keuangan/laporan">
                <FileDown className="size-4" />
                Kembali ke Laporan
              </Link>
            </Button>
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Laporan Realisasi APBDes Per Triwulan</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
        <p className="text-sm">Tahun Anggaran {tahun}</p>
      </div>

      {baris.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Table2 className="size-5" />
            <p className="text-sm">
              Belum ada bidang belanja (kode <code>5.x</code>) untuk tahun {tahun}. Isi pagu APBDes
              terlebih dahulu.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/keuangan/anggaran?tahun=${tahun}`}>Buka Anggaran</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {canManage ? (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-base">Input Realisasi Triwulan</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Masukkan realisasi belanja tiap bidang sesuai periode. Angka yang disimpan di sini
                  adalah sumber laporan — tidak diturunkan dari realisasi tahunan.
                </p>
              </CardHeader>
              <CardContent>
                <TriwulanInputTable tahun={tahun} rows={baris} />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Realisasi per Bidang &amp; Triwulan</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Kode</TableHead>
                    <TableHead>Bidang</TableHead>
                    <TableHead className="w-36 text-right">Anggaran</TableHead>
                    <TableHead className="w-32 text-right">TW I</TableHead>
                    <TableHead className="w-32 text-right">TW II</TableHead>
                    <TableHead className="w-32 text-right">TW III</TableHead>
                    <TableHead className="w-32 text-right">TW IV</TableHead>
                    <TableHead className="w-36 text-right">Realisasi</TableHead>
                    <TableHead className="w-24 text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baris.map((row) => (
                    <TableRow key={row.kode}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.kode}
                      </TableCell>
                      <TableCell className="font-medium">{row.uraian}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(row.tw1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(row.tw2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(row.tw3)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(row.tw4)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.persen.toFixed(2)}%
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
                      {formatRupiah(total.tw1)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.tw2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.tw3)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.tw4)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(total.realisasi)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {total.persen.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <p className="mt-3 text-xs text-muted-foreground">
                Kolom Realisasi = jumlah TW I–IV yang diisi. Persentase dihitung terhadap pagu
                anggaran bidang pada tahun {tahun}.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
