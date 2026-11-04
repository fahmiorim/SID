import { ArrowLeft, FileText } from "lucide-react";
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
import { getNeracaAset } from "@/features/inventaris/application/inventaris-use-cases";
import {
  INVENTARIS_KONDISI,
  INVENTARIS_KONDISI_LABELS,
} from "@/features/inventaris/domain/inventaris";
import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatJumlah } from "@/features/publik/domain/ringkasan-publik";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Neraca Aset Desa" };

export default async function NeracaAsetPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.inventaris, "read")) {
    return (
      <NoAccess
        title="Neraca Aset Desa"
        description="Anda tidak memiliki akses untuk melihat neraca kekayaan aset desa."
      />
    );
  }

  const [{ neraca }, desa] = await Promise.all([getNeracaAset(), getIdentitas()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Neraca Aset Desa"
        description="Total kekayaan aset desa per kategori dan kondisi."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/inventaris/laporan">
                <FileText className="size-4" />
                Laporan
              </Link>
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
        <p className="text-lg font-bold uppercase">Neraca Kekayaan Aset Desa</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Total Kekayaan Aset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">{formatRupiah(neraca.grandTotal)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neraca per Kategori &amp; Kondisi</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah Barang</TableHead>
                <TableHead className="text-right">Total Unit</TableHead>
                {INVENTARIS_KONDISI.map((kondisi) => (
                  <TableHead key={kondisi} className="text-right">
                    {INVENTARIS_KONDISI_LABELS[kondisi]}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {neraca.baris.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4 + INVENTARIS_KONDISI.length}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada data inventaris.
                  </TableCell>
                </TableRow>
              ) : (
                neraca.baris.map((baris) => (
                  <TableRow key={baris.kategoriId ?? baris.nama}>
                    <TableCell>{baris.nama}</TableCell>
                    <TableCell className="text-right tabular-nums">{baris.jumlahBarang}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatJumlah(baris.totalUnit)}
                    </TableCell>
                    {INVENTARIS_KONDISI.map((kondisi) => (
                      <TableCell key={kondisi} className="text-right tabular-nums">
                        {formatRupiah(baris.nilaiPerKondisi[kondisi])}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatRupiah(baris.totalNilai)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Jumlah Kekayaan</TableCell>
                {INVENTARIS_KONDISI.map((kondisi) => (
                  <TableCell key={kondisi} className="text-right tabular-nums">
                    {formatRupiah(neraca.totalPerKondisi[kondisi])}
                  </TableCell>
                ))}
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(neraca.grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
