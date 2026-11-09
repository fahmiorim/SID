import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KATEGORI_LABELS,
  KATEGORI_PEMERIKSAAN,
  type KategoriPemeriksaan,
  type TemuanPemeriksaan,
} from "@/features/periksa/domain/periksa";
import { listPemeriksaanAction } from "@/features/periksa/presentation/periksa-actions";

export const metadata = { title: "Pemeriksaan Data" };

function contohTeks(temuan: TemuanPemeriksaan): string {
  if (temuan.contoh.length === 0) return "-";
  const teks = temuan.contoh.map((baris) => baris.label).join(", ");
  const sisa = temuan.jumlah - temuan.contoh.length;
  return sisa > 0 ? `${teks}, +${sisa} lainnya` : teks;
}

export default async function PeriksaPage() {
  const { temuan, ringkasan } = await listPemeriksaanAction();

  const perKategori = KATEGORI_PEMERIKSAAN.map((kategori) => ({
    kategori,
    items: temuan.filter((item) => item.kategori === kategori),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemeriksaan Data"
        description="Menemukan data kependudukan yang tidak konsisten tanpa mengubahnya."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Temuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{ringkasan.totalTemuan}</p>
            <p className="text-xs text-muted-foreground">baris data perlu diperiksa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jenis Bermasalah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {ringkasan.jenisBermasalah} / {ringkasan.totalJenis}
            </p>
            <p className="text-xs text-muted-foreground">pemeriksaan menemukan data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {ringkasan.bersih ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">Bersih</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-medium">Perlu perbaikan</span>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {ringkasan.bersih ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Tidak ada data yang perlu diperbaiki pada pemeriksaan ini.
          </CardContent>
        </Card>
      ) : null}

      {perKategori.map(({ kategori, items }) => (
        <KartuKategori key={kategori} kategori={kategori} items={items} />
      ))}
    </div>
  );
}

function KartuKategori({
  kategori,
  items,
}: {
  kategori: KategoriPemeriksaan;
  items: readonly TemuanPemeriksaan[];
}) {
  const jumlah = items.reduce((total, item) => total + item.jumlah, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{KATEGORI_LABELS[kategori]}</CardTitle>
        <Badge variant={jumlah > 0 ? "destructive" : "secondary"}>
          {jumlah > 0 ? `${jumlah} temuan` : "Bersih"}
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pemeriksaan</TableHead>
              <TableHead>Contoh Data</TableHead>
              <TableHead className="w-24 text-right">Jumlah</TableHead>
              <TableHead className="w-40 text-right">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.kode}>
                <TableCell className="align-top">
                  <p className="font-medium">{item.nama}</p>
                  <p className="text-xs text-muted-foreground">{item.keterangan}</p>
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">
                  {contohTeks(item)}
                </TableCell>
                <TableCell className="text-right align-top font-medium">{item.jumlah}</TableCell>
                <TableCell className="text-right align-top">
                  <Button asChild variant="outline" size="sm">
                    <Link href={item.perbaikan.href}>
                      {item.perbaikan.label}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
