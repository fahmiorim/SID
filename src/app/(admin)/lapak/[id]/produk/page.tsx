import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { daftarProdukLapak } from "@/features/lapak/application/lapak-product-use-cases";
import { ProdukTable } from "@/features/lapak/presentation/components/produk-table";
import { getCurrentUser } from "@/lib/dal";

export const metadata = { title: "Kelola Produk" };

export default async function ProdukLapakPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { id } = await params;
  const lapakId = Number(id);
  if (!lapakId) notFound();

  const user = await getCurrentUser();
  if (!user?.villageId) notFound();

  const query = await searchParams;
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const requestedPage = Number(pageValue);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const productPage = await daftarProdukLapak(user.villageId, lapakId, { page });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Produk Lapak"
        description="Daftar produk yang tersedia di lapak ini"
      />
      <p className="text-sm text-muted-foreground">
        {productPage.total} produk · Halaman {productPage.page} dari {productPage.pageCount}
      </p>
      <ProdukTable items={productPage.rows} lapakId={lapakId} />
      {productPage.pageCount > 1 && (
        <nav
          aria-label="Navigasi halaman produk"
          className="flex items-center justify-center gap-4"
        >
          {productPage.page > 1 ? (
            <Link href={`?page=${productPage.page - 1}`} rel="prev" className="underline">
              Sebelumnya
            </Link>
          ) : (
            <span className="text-muted-foreground">Sebelumnya</span>
          )}
          {productPage.page < productPage.pageCount ? (
            <Link href={`?page=${productPage.page + 1}`} rel="next" className="underline">
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
