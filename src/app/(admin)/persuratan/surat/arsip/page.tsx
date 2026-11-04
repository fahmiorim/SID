import { Download } from "lucide-react";
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
import { ARSIP_PER_HALAMAN, totalHalaman } from "@/features/surat/domain/arsip-nomor";
import { formatTanggalIndonesia, SURAT_RESOURCE } from "@/features/surat/domain/surat";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Arsip Nomor Surat",
};

function angkaPositif(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

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
  const typeId = angkaPositif(typeof params.jenis === "string" ? params.jenis : undefined);
  const classificationId = angkaPositif(
    typeof params.klasifikasi === "string" ? params.klasifikasi : undefined,
  );
  const page = angkaPositif(typeof params.page === "string" ? params.page : undefined) ?? 1;

  const result = await listArsipNomorSuratData({
    search,
    year,
    typeId,
    classificationId,
    page,
  });

  const halaman = totalHalaman(result.total);
  const query = new URLSearchParams();
  if (search) query.set("q", search);
  if (year) query.set("year", String(year));
  if (typeId) query.set("jenis", String(typeId));
  if (classificationId) query.set("klasifikasi", String(classificationId));

  const hrefUntuk = (perubahan: { page?: number }) => {
    const next = new URLSearchParams(query);
    if (perubahan.page && perubahan.page > 1) next.set("page", String(perubahan.page));
    else next.delete("page");
    const teks = next.toString();
    return `/persuratan/surat/arsip${teks ? `?${teks}` : ""}`;
  };

  const exportQuery = new URLSearchParams(query);
  const exportHref = `/persuratan/surat/arsip/ekspor${
    exportQuery.toString() ? `?${exportQuery.toString()}` : ""
  }`;

  const adaFilter = Boolean(search || year || typeId || classificationId);
  const mulai = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const selesai = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arsip Nomor Surat"
        description="Nomor surat yang pernah diterbitkan tetap tercatat meski surat sumber dihapus."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <a href={exportHref}>
                <Download className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/persuratan/surat">Kembali ke layanan surat</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              defaultValue={search}
              placeholder="Cari nomor atau jenis surat"
              className="flex-1 sm:max-w-xs"
              aria-label="Cari nomor atau jenis surat"
            />
            <select
              name="jenis"
              defaultValue={typeId ? String(typeId) : ""}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              aria-label="Saring jenis surat"
            >
              <option value="">Semua jenis</option>
              {result.jenis.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              name="klasifikasi"
              defaultValue={classificationId ? String(classificationId) : ""}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              aria-label="Saring klasifikasi surat"
            >
              <option value="">Semua klasifikasi</option>
              {result.klasifikasi.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} — {item.name}
                </option>
              ))}
            </select>
            <Input
              name="year"
              type="number"
              min={1900}
              max={9999}
              defaultValue={year}
              placeholder="Tahun"
              className="w-28"
              aria-label="Saring tahun terbit"
            />
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {adaFilter ? (
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
                      {adaFilter
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              Menampilkan {mulai}–{selesai} dari {result.total} nomor.
            </p>
            <div className="flex items-center gap-2">
              {result.page <= 1 ? (
                <Button variant="outline" size="sm" disabled>
                  Sebelumnya
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefUntuk({ page: result.page - 1 })}>Sebelumnya</Link>
                </Button>
              )}
              <span className="tabular-nums">
                Halaman {result.page} / {halaman}
              </span>
              {result.page >= halaman ? (
                <Button variant="outline" size="sm" disabled>
                  Berikutnya
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefUntuk({ page: result.page + 1 })}>Berikutnya</Link>
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Maksimal {ARSIP_PER_HALAMAN} baris per halaman; ekspor CSV memuat seluruh hasil filter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
