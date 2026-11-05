import { FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBukuPembangunan,
  listTahunAnggaran,
} from "@/features/pembangunan/application/use-cases";
import {
  anggaranTampil,
  buildBukuPembangunan,
  totalBukuPembangunan,
} from "@/features/pembangunan/domain/buku-pembangunan";
import {
  PEMBANGUNAN_RESOURCE,
  statusPembangunanLabel,
} from "@/features/pembangunan/domain/pembangunan";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Buku Pembangunan Desa",
};

export default async function BukuPembangunanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PEMBANGUNAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Buku Pembangunan Desa"
        description="Rekap rencana, anggaran, dan realisasi proyek pembangunan."
      />
    );
  }

  const params = await searchParams;
  const tahunParam = Number(params.tahun ?? "");
  const tahun = Number.isInteger(tahunParam) && tahunParam > 2000 ? tahunParam : null;

  const [rows, tahunList] = await Promise.all([getBukuPembangunan(tahun), listTahunAnggaran()]);
  const buku = buildBukuPembangunan(rows);
  const total = totalBukuPembangunan(buku);
  const tautanEkspor =
    tahun === null ? "/pembangunan/buku/ekspor" : `/pembangunan/buku/ekspor?tahun=${tahun}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Pembangunan Desa"
        description="Rekap proyek per tahun anggaran beserta status, anggaran, dan progres."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button asChild variant="outline">
              <Link href="/pembangunan">Kembali</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={tautanEkspor}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <PrintButton />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Button asChild variant={tahun === null ? "secondary" : "ghost"} size="sm">
          <Link href="/pembangunan/buku">Semua tahun</Link>
        </Button>
        {tahunList.map((item) => (
          <Button key={item} asChild variant={item === tahun ? "secondary" : "ghost"} size="sm">
            <Link href={`/pembangunan/buku?tahun=${item}`}>{item}</Link>
          </Button>
        ))}
      </div>

      {buku.length === 0 ? (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          Belum ada proyek pembangunan untuk filter ini.
        </p>
      ) : (
        <>
          <Card>
            <CardContent className="space-y-3">
              <h2 className="font-semibold">Rekap per Tahun Anggaran</h2>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tahun</TableHead>
                      <TableHead className="w-24 text-right">Proyek</TableHead>
                      <TableHead className="w-24 text-right">Selesai</TableHead>
                      <TableHead className="w-24 text-right">Berjalan</TableHead>
                      <TableHead className="w-32 text-right">Anggaran</TableHead>
                      <TableHead className="w-28 text-right">Progres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buku.map((item) => (
                      <TableRow key={item.tahun}>
                        <TableCell className="font-medium">{item.tahun}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.jumlahProyek}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{item.selesai}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.berjalan}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {anggaranTampil(item.totalAnggaran)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.progresRataRata}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {total.jumlahProyek}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {total.selesai}
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right font-semibold tabular-nums">
                        {anggaranTampil(total.totalAnggaran)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {total.progresRataRata}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {buku.map((item) => (
            <Card key={item.tahun}>
              <CardContent className="space-y-3">
                <h2 className="font-semibold">Rincian Proyek {item.tahun}</h2>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">No</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead className="w-40">Lokasi</TableHead>
                        <TableHead className="w-32">Sumber Dana</TableHead>
                        <TableHead className="w-32 text-right">Anggaran</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                        <TableHead className="w-20 text-right">Progres</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.proyek.map((proyek, indeks) => (
                        <TableRow key={proyek.id}>
                          <TableCell className="tabular-nums">{indeks + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{proyek.judul}</div>
                            {proyek.hasil ? (
                              <p className="text-xs text-muted-foreground">Hasil: {proyek.hasil}</p>
                            ) : null}
                          </TableCell>
                          <TableCell>{proyek.lokasi ?? "—"}</TableCell>
                          <TableCell>{proyek.sumberDana ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {anggaranTampil(Number(proyek.anggaran ?? 0) || 0)}
                          </TableCell>
                          <TableCell>{statusPembangunanLabel(proyek.status)}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {proyek.progres}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
