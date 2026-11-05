import { ArrowLeft, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { getLaporanRealisasiResmi } from "@/features/keuangan/application/keuangan-use-cases";
import {
  formatRupiah,
  LAPORAN_KEUANGAN_RESOURCE,
  type RpApbdTotal,
} from "@/features/keuangan/domain/keuangan";
import { LaporanPrintButton } from "@/features/keuangan/presentation/components/laporan-print-button";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rincian Realisasi APBDes",
};

/** Baris penutup (SURPLUS, PEMBIAYAAN NETTO, SiLPA) dengan sorotan cetak. */
function BarisPenutup({ label, nilai }: { label: string; nilai: RpApbdTotal }) {
  return (
    <TableRow className="bg-primary/10 font-semibold hover:bg-primary/10">
      <TableCell>{label}</TableCell>
      <TableCell className="text-right tabular-nums">{formatRupiah(nilai.anggaran)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatRupiah(nilai.realisasi)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatRupiah(nilai.selisih)}</TableCell>
      <TableCell className="text-right tabular-nums">-</TableCell>
    </TableRow>
  );
}

export default async function RincianRealisasiPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, LAPORAN_KEUANGAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Rincian Realisasi APBDes"
        description="Anda tidak memiliki akses untuk melihat rincian realisasi APBDes."
      />
    );
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const [{ tahun, tersedia, laporan }, desa] = await Promise.all([
    getLaporanRealisasiResmi(tahunParam),
    getIdentitas(),
  ]);

  const tahunList = [...new Set([...tersedia, tahun])].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rincian Realisasi APBDes"
        description="Laporan realisasi pelaksanaan APBDes format resmi per rekening."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href={`/keuangan/laporan?tahun=${tahun}`}>
                <ArrowLeft className="size-4" />
                Laporan Ringkas
              </Link>
            </Button>
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/laporan/realisasi?tahun=${item}`}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors",
                  item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40",
                )}
              >
                {item}
              </Link>
            ))}
            <Button variant="outline" asChild>
              <a href={`/keuangan/laporan/realisasi/ekspor?tahun=${tahun}`}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <LaporanPrintButton />
          </div>
        }
      />

      <div className="text-center">
        <p className="text-base font-bold uppercase print:text-lg">Laporan Realisasi Pelaksanaan</p>
        <p className="text-base font-bold uppercase print:text-lg">
          Anggaran Pendapatan dan Belanja Desa
        </p>
        <p className="text-sm font-semibold uppercase">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
        <p className="text-sm">Tahun Anggaran {tahun}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[16rem]">Uraian</TableHead>
              <TableHead className="w-40 text-right">Anggaran (Rp)</TableHead>
              <TableHead className="w-40 text-right">Realisasi (Rp)</TableHead>
              <TableHead className="w-40 text-right">Lebih/(Kurang)</TableHead>
              <TableHead className="w-28 text-right">Persentase (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laporan.blok.map((blok) => (
              <Fragment key={blok.akun.kode}>
                <TableRow className="border-t-2 bg-muted/40 hover:bg-muted/40">
                  <TableCell className="font-semibold">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {blok.akun.kode}
                    </span>
                    {blok.akun.uraian.toUpperCase()}
                  </TableCell>
                  <TableCell colSpan={4} />
                </TableRow>

                {blok.baris.map((row) => (
                  <TableRow key={row.kode}>
                    <TableCell>
                      <span
                        className="flex items-baseline gap-2"
                        style={{ paddingLeft: `${(row.depth - 1) * 16}px` }}
                      >
                        <span className="font-mono text-xs text-muted-foreground">{row.kode}</span>
                        <span>{row.uraian}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(row.anggaran)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(row.realisasi)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(row.selisih)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.persen === null ? "-" : `${row.persen.toFixed(2)}%`}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-primary/10 font-semibold hover:bg-primary/10">
                  <TableCell>JUMLAH {blok.akun.uraian.toUpperCase()}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(blok.total.anggaran)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(blok.total.realisasi)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(blok.total.selisih)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {blok.akun.kode === "6" ? "-" : `${(blok.akun.persen ?? 0).toFixed(2)}%`}
                  </TableCell>
                </TableRow>

                {blok.akun.kode === "5" ? (
                  <BarisPenutup label="SURPLUS / (DEFISIT)" nilai={laporan.surplus} />
                ) : null}

                {blok.akun.kode === "6" ? (
                  <>
                    <BarisPenutup label="PEMBIAYAAN NETTO" nilai={laporan.pembiayaanNetto} />
                    <BarisPenutup label="SILPA/SiLPA TAHUN BERJALAN" nilai={laporan.silpa} />
                  </>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground print:hidden">
        Baris JUMLAH dihitung dari nilai akun yang sudah teragregasi; SURPLUS/(DEFISIT), PEMBIAYAAN
        NETTO, dan SiLPA mengikuti susunan laporan APBDes. Angka pembiayaan ditampilkan netto
        (penerimaan dikurangi pengeluaran).
      </p>
    </div>
  );
}
