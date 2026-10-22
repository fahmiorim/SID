import { Newspaper, Plus, Search, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
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
import { listBerita } from "@/features/konten/application/berita-use-cases";
import { BERITA_RESOURCE, labelStatusBerita, STATUS_BERITA } from "@/features/konten/domain/berita";
import { BeritaRowActions } from "@/features/konten/presentation/components/berita-row-actions";
import { formatTanggal } from "@/features/publik/domain/format";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Berita & Artikel",
};

const PAGE_SIZE = 10;

export default async function BeritaPage({ searchParams }: PageProps<"/konten/berita">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, BERITA_RESOURCE, "read")) {
    return <NoAccess title="Berita & Artikel" description="Kelola berita dan artikel desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listBerita({ search, status, page: requestedPage, pageSize: PAGE_SIZE });
  const canManage = hasPermission(user.permissions, BERITA_RESOURCE, "update");

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (status) query.set("status", status);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/konten/berita?${qs}` : "/konten/berita";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berita & Artikel"
        description="Tulis berita desa, atur jadwal terbit, dan kelompokkan dengan kategori."
        actions={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/konten/berita/kategori">
                  <Tags className="size-4" />
                  Kategori
                </Link>
              </Button>
              <Button asChild>
                <Link href="/konten/berita/baru">
                  <Plus className="size-4" />
                  Tulis Berita
                </Link>
              </Button>
            </div>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-end gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Cari judul atau ringkasan…"
                className="pl-8"
                aria-label="Cari berita"
              />
            </div>

            <div className="w-40">
              <select
                name="status"
                defaultValue={status}
                aria-label="Filter status"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Semua status</option>
                {STATUS_BERITA.map((nilai) => (
                  <option key={nilai} value={nilai}>
                    {labelStatusBerita(nilai)}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="outline">
              Terapkan
            </Button>
            {search || status ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/konten/berita">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead className="w-36">Kategori</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-36">Terbit</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Newspaper className="size-5" />
                        <p className="text-sm">
                          {search || status
                            ? "Tidak ada berita yang cocok dengan filter."
                            : "Belum ada berita. Mulai dengan menulis berita pertama."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{row.judul}</span>
                          {row.headline ? (
                            <Badge variant="secondary" className="text-xs">
                              Headline
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <code>{row.slug}</code>
                        </p>
                      </TableCell>
                      <TableCell>{row.kategori ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={row.status === "published" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {labelStatusBerita(row.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.terbitPada ? formatTanggal(row.terbitPada) : "Belum dijadwalkan"}
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <BeritaRowActions berita={row} />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {result.total === 0
                ? "Tidak ada data"
                : `Menampilkan ${from}–${to} dari ${result.total} berita`}
            </p>

            {result.pageCount > 1 ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={pageHref(Math.max(1, result.page - 1))}
                    aria-disabled={result.page <= 1}
                    className={result.page <= 1 ? "pointer-events-none opacity-50" : undefined}
                  >
                    Sebelumnya
                  </Link>
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {result.page} / {result.pageCount}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={pageHref(Math.min(result.pageCount, result.page + 1))}
                    aria-disabled={result.page >= result.pageCount}
                    className={
                      result.page >= result.pageCount ? "pointer-events-none opacity-50" : undefined
                    }
                  >
                    Berikutnya
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
