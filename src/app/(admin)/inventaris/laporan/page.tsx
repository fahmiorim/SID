import { ArrowLeft, FileDown, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { PrintButton } from "@/components/layout/page-header-actions";
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
import { getLaporanInventaris } from "@/features/inventaris/application/inventaris-use-cases";
import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatJumlah } from "@/features/publik/domain/ringkasan-publik";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Laporan Inventaris" };

export default async function LaporanInventarisPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.inventaris, "read")) {
    return (
      <NoAccess
        title="Laporan Inventaris"
        description="Anda tidak memiliki akses untuk melihat laporan inventaris desa."
      />
    );
  }

  const params = await searchParams;
  const kategoriId = params.kategori ? Number(params.kategori) : undefined;
  const kategoriParam = Number.isFinite(kategoriId) ? kategoriId : undefined;

  const [laporan, desa] = await Promise.all([getLaporanInventaris(kategoriParam), getIdentitas()]);
  const kategoriTerpilih = laporan.kategori.find((item) => item.id === laporan.kategoriId);
  const eksporHref = laporan.kategoriId
    ? `/inventaris/laporan/ekspor?kategori=${laporan.kategoriId}`
    : "/inventaris/laporan/ekspor";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Inventaris"
        description="Rekap jumlah unit dan nilai aset desa per kategori."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/inventaris/neraca">
                <Scale className="size-4" />
                Neraca Aset
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={eksporHref}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <PrintButton />
            <Button variant="outline" asChild>
              <Link href="/inventaris">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Laporan Inventaris & Aset Desa</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
        {kategoriTerpilih ? <p className="text-sm">Kategori: {kategoriTerpilih.nama}</p> : null}
      </div>

      <Card className="print:hidden">
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Filter Kategori</span>
              <select
                name="kategori"
                defaultValue={laporan.kategoriId ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">Semua Kategori</option>
                {laporan.kategori.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="outline">
              Terapkan
            </Button>
            {laporan.kategoriId ? (
              <Button variant="ghost" asChild>
                <Link href="/inventaris/laporan">Reset</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rekap per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah Barang</TableHead>
                <TableHead className="text-right">Total Unit</TableHead>
                <TableHead className="text-right">Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.rekap.baris.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada data inventaris.
                  </TableCell>
                </TableRow>
              ) : (
                laporan.rekap.baris.map((baris) => (
                  <TableRow key={baris.kategoriId ?? baris.nama}>
                    <TableCell className="tabular-nums">{baris.kode ?? "-"}</TableCell>
                    <TableCell>{baris.nama}</TableCell>
                    <TableCell className="text-right tabular-nums">{baris.jumlahBarang}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatJumlah(baris.totalUnit)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(baris.totalNilai)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Jumlah</TableCell>
                <TableCell className="text-right tabular-nums">
                  {laporan.rekap.total.jumlahBarang}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatJumlah(laporan.rekap.total.totalUnit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(laporan.rekap.total.totalNilai)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
