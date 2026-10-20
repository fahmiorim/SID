import { FileDown, FileSpreadsheet, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { listLaporanKeuanganDokumen } from "@/features/keuangan/application/laporan-dokumen-use-cases";
import { KEUANGAN_RESOURCE, LAPORAN_KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import { LaporanDokumenCreateButton } from "@/features/keuangan/presentation/components/laporan-dokumen-form-dialog";
import { LaporanDokumenRowActions } from "@/features/keuangan/presentation/components/laporan-dokumen-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Dokumen Laporan APBDes",
};

function tanggalRingkas(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default async function LaporanDokumenPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, LAPORAN_KEUANGAN_RESOURCE, "read")) {
    return (
      <NoAccess title="Dokumen Laporan APBDes" description="Arsip dokumen laporan per semester." />
    );
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const { tahun, tahunTersedia, rows, periode } = await listLaporanKeuanganDokumen(tahunParam);

  const bisaUbah = hasPermission(user.permissions, LAPORAN_KEUANGAN_RESOURCE, "update");
  const tahunList = [...new Set([...tahunTersedia, tahun])].sort((a, b) => a - b);
  const baris = rows.filter((row) => row.tahun === tahun);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen Laporan APBDes"
        description="Arsip dokumen laporan per semester yang disiapkan untuk kecamatan/OpenDK."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/laporan-dokumen?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors ${
                  item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"
                }`}
              >
                {item}
              </Link>
            ))}
            {bisaUbah ? <LaporanDokumenCreateButton tahunDefault={tahun} /> : null}
          </div>
        }
      />

      <Alert>
        <Info />
        <AlertTitle>Dokumen, bukan perhitungan</AlertTitle>
        <AlertDescription>
          Halaman ini menyimpan berkas laporan resmi yang Anda siapkan sendiri. Untuk laporan yang
          dihitung otomatis dari pohon rekening, gunakan{" "}
          <Link href="/keuangan/laporan" className="font-medium underline underline-offset-4">
            Laporan Keuangan
          </Link>
          .
        </AlertDescription>
      </Alert>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Dokumen Tahun {tahun}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tabular-nums">{periode.jumlahDokumen}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Periode Tercatat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tabular-nums">
              {periode.tercatat.length > 0 ? periode.tercatat.join(", ") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Kelengkapan Semester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {periode.belumLengkap ? (
                <Badge variant="outline" className="border-amber-500/40 text-amber-600">
                  Belum lengkap
                </Badge>
              ) : (
                <Badge variant="secondary">Lengkap</Badge>
              )}
            </p>
            {periode.belumLengkap ? (
              <p className="mt-1 text-xs text-muted-foreground">{periode.belumLengkap}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Dokumen Tahun {tahun}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/keuangan/laporan/ekspor-excel?tahun=${tahun}`}>
                <FileSpreadsheet className="size-4" />
                Excel RP APBDes
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/keuangan/laporan/ekspor?tahun=${tahun}`}>
                <FileDown className="size-4" />
                CSV RP APBDes
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead className="w-40">Jenis</TableHead>
                <TableHead className="w-36">Semester</TableHead>
                <TableHead className="w-32">Berkas</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-36">Dikirim</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {baris.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                    Belum ada dokumen laporan pada tahun ini.
                  </TableCell>
                </TableRow>
              ) : (
                baris.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.judul}</TableCell>
                    <TableCell className="text-muted-foreground">{row.tipeLabel}</TableCell>
                    <TableCell>{row.semesterLabel}</TableCell>
                    <TableCell>
                      <a
                        href={`/keuangan/laporan-dokumen/${row.id}/berkas`}
                        className="text-sm underline underline-offset-4"
                      >
                        Unduh PDF
                      </a>
                    </TableCell>
                    <TableCell>
                      {row.terkirim ? (
                        <Badge variant="secondary">Terkirim</Badge>
                      ) : (
                        <Badge variant="outline">Belum dikirim</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {tanggalRingkas(row.kirimPada)}
                    </TableCell>
                    <TableCell className="text-right">
                      {bisaUbah ? (
                        <LaporanDokumenRowActions laporan={row} tahunDefault={tahun} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Modul ini adalah Lapis D (arsip dokumen). Ekspor Excel/CSV di atas mengunduh laporan yang
        dihitung dari pohon rekening <span className="font-mono">{KEUANGAN_RESOURCE}</span> pada
        tahun yang dipilih.
      </p>
    </div>
  );
}
