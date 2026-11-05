import { FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLaporanAnggota } from "@/features/kelompok/application/use-cases";
import {
  jabatanLabel,
  KELOMPOK_RESOURCE,
  KELOMPOK_TIPE,
  kelompokTipeLabel,
  type KelompokTipe,
} from "@/features/kelompok/domain/kelompok";
import {
  judulLaporanAnggota,
  kelompokkanAnggota,
} from "@/features/kelompok/domain/laporan-anggota";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Laporan Anggota Kelompok",
};

export default async function KelompokLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tipe?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KELOMPOK_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Laporan Anggota Kelompok"
        description="Daftar anggota kelompok masyarakat dan lembaga desa."
      />
    );
  }

  const params = await searchParams;
  const tipeParam = params.tipe ?? "";
  const tipe: KelompokTipe | "" = KELOMPOK_TIPE.includes(tipeParam as KelompokTipe)
    ? (tipeParam as KelompokTipe)
    : "";

  const rows = await getLaporanAnggota(tipe);
  const kelompok = kelompokkanAnggota(rows);
  const tautanEkspor = tipe ? `/kelompok/ekspor?tipe=${tipe}` : "/kelompok/ekspor";

  return (
    <div className="space-y-6">
      <PageHeader
        title={judulLaporanAnggota(tipe)}
        description="Rincian anggota per kelompok beserta jabatan, NIK, dan nomor keanggotaan."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button asChild variant="outline">
              <Link href="/kelompok">Kembali</Link>
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

      {kelompok.length === 0 ? (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          Belum ada anggota kelompok yang tercatat untuk filter ini.
        </p>
      ) : (
        kelompok.map((item) => (
          <section key={item.kelompokId} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">{item.kelompokNama}</h2>
              <p className="text-xs text-muted-foreground">
                {kelompokTipeLabel(item.kelompokTipe)}
                {item.kategoriNama ? ` · ${item.kategoriNama}` : ""} · {item.anggota.length} anggota
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Nama Anggota</TableHead>
                    <TableHead className="w-44">NIK</TableHead>
                    <TableHead className="w-36">Jabatan</TableHead>
                    <TableHead className="w-32">No. Anggota</TableHead>
                    <TableHead className="w-32">No. SK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.anggota.map((anggota, indeks) => (
                    <TableRow key={`${anggota.kelompokId}-${anggota.nama}-${indeks}`}>
                      <TableCell className="tabular-nums">{indeks + 1}</TableCell>
                      <TableCell>{anggota.nama}</TableCell>
                      <TableCell>{anggota.nationalId ?? "—"}</TableCell>
                      <TableCell>{jabatanLabel(anggota.position)}</TableCell>
                      <TableCell>{anggota.memberNumber ?? "—"}</TableCell>
                      <TableCell>{anggota.decreeNumber ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
