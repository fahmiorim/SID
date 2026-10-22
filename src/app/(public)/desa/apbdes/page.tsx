import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getLaporanApbdesPublik } from "@/features/keuangan/application/laporan-publik-use-cases";

export const dynamic = "force-dynamic";

export const metadata = { title: "Transparansi APBDes" };

export default async function ApbdesPublikPage() {
  const desa = await getIdentitasFromRequest();
  const laporan = await getLaporanApbdesPublik(desa.id);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Transparansi APBDes</h1>
        <p className="text-muted-foreground">
          Ringkasan Anggaran Pendapatan dan Belanja Desa {desa.namaDesa ?? "desa"} tahun{" "}
          {laporan.tahun}.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Uraian</TableHead>
              <TableHead className="text-right">Anggaran</TableHead>
              <TableHead className="text-right">Realisasi</TableHead>
              <TableHead className="text-right">Selisih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laporan.baris.map((row) => (
              <TableRow key={row.kode}>
                <TableCell className="font-medium">{row.uraian}</TableCell>
                <TableCell className="text-right tabular-nums">{row.anggaran}</TableCell>
                <TableCell className="text-right tabular-nums">{row.realisasi}</TableCell>
                <TableCell className="text-right tabular-nums">{row.selisih}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right tabular-nums">{laporan.total.anggaran}</TableCell>
              <TableCell className="text-right tabular-nums">{laporan.total.realisasi}</TableCell>
              <TableCell className="text-right tabular-nums">{laporan.total.selisih}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Realisasi Belanja per Bidang</h2>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidang</TableHead>
                <TableHead className="text-right">Anggaran</TableHead>
                <TableHead className="text-right">Realisasi</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.bidang.map((row) => (
                <TableRow key={row.kode}>
                  <TableCell className="font-medium">{row.uraian}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.anggaran}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.realisasi}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/desa/statistik">Lihat Statistik Desa</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/desa/dokumen">Informasi & Dokumen Publik</Link>
        </Button>
      </div>
    </div>
  );
}
