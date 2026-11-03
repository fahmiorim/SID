import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { listArsipNomorSuratData } from "@/features/surat/application/surat-use-cases";
import { formatTanggalIndonesia, SURAT_RESOURCE } from "@/features/surat/domain/surat";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Arsip Nomor Surat",
};

export default async function ArsipNomorSuratPage({
  searchParams,
}: PageProps<"/persuratan/surat/arsip">) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, SURAT_RESOURCE, "read")) {
    return (
      <NoAccess title="Arsip Nomor Surat" description="Daftar nomor surat yang diterbitkan desa." />
    );
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const rawYear = typeof params.year === "string" ? params.year : "";
  const parsedYear = /^\d{4}$/.test(rawYear) ? Number(rawYear) : undefined;
  const year = parsedYear !== undefined && parsedYear >= 1900 ? parsedYear : undefined;
  const result = await listArsipNomorSuratData({ search, year });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arsip Nomor Surat"
        description="Nomor surat yang pernah diterbitkan tetap tercatat meski surat sumber dihapus."
        actions={
          <Button variant="outline" asChild>
            <Link href="/persuratan/surat">Kembali ke layanan surat</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              defaultValue={search}
              placeholder="Cari nomor atau jenis surat"
              className="flex-1 sm:max-w-sm"
              aria-label="Cari nomor atau jenis surat"
            />
            <Input
              name="year"
              type="number"
              min={1900}
              max={9999}
              defaultValue={year}
              placeholder="Tahun"
              className="w-32"
              aria-label="Saring tahun terbit"
            />
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search || year ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/persuratan/surat/arsip">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor surat</TableHead>
                  <TableHead>Jenis surat</TableHead>
                  <TableHead className="w-28 text-right">Nomor urut</TableHead>
                  <TableHead className="w-24">Tahun</TableHead>
                  <TableHead className="w-40">Tanggal terbit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      {search || year
                        ? "Tidak ada nomor arsip yang cocok."
                        : "Belum ada nomor surat terbit."}
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium tabular-nums">{row.number}</TableCell>
                      <TableCell>{row.typeName}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.sequence}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>
                        {formatTanggalIndonesia(row.issuedAt.toISOString().slice(0, 10))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Menampilkan {result.rows.length} dari {result.total} nomor. Maksimal 200 hasil per
            pencarian.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
