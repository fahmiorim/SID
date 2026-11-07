import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { LapakTable } from "@/features/lapak/presentation/components/lapak-table";
import {
  listKategoriLapakAction,
  listLapakAction,
} from "@/features/lapak/presentation/lapak-actions";

export const metadata = { title: "Lapak UMKM" };

export default async function LapakPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const pageValue = Array.isArray(params.page) ? params.page[0] : params.page;
  const requestedPage = Number(pageValue);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [lapakPage, kategoriList] = await Promise.all([
    listLapakAction({ page }),
    listKategoriLapakAction(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lapak UMKM"
        description="Kelola data lapak usaha mikro, kecil, dan menengah (UMKM) desa"
      />
      <p className="text-sm text-muted-foreground">
        {lapakPage.total} lapak · Halaman {lapakPage.page} dari {lapakPage.pageCount}
      </p>
      <LapakTable items={lapakPage.rows} kategoriList={kategoriList} />
      {lapakPage.pageCount > 1 && (
        <nav aria-label="Navigasi halaman lapak" className="flex items-center justify-center gap-4">
          {lapakPage.page > 1 ? (
            <Link href={`?page=${lapakPage.page - 1}`} rel="prev" className="underline">
              Sebelumnya
            </Link>
          ) : (
            <span className="text-muted-foreground">Sebelumnya</span>
          )}
          {lapakPage.page < lapakPage.pageCount ? (
            <Link href={`?page=${lapakPage.page + 1}`} rel="next" className="underline">
              Berikutnya
            </Link>
          ) : (
            <span className="text-muted-foreground">Berikutnya</span>
          )}
        </nav>
      )}
    </div>
  );
}
