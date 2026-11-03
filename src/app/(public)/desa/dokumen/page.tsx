import type { Metadata } from "next";

import { daftarDokumenPublik } from "@/features/publik/application/dokumen-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { parseDokumenKategoriFilter } from "@/features/publik/domain/dokumen";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Informasi Publik · ${desa.namaDesa ?? "Desa"}`,
    description: `Dokumen resmi dan informasi publik ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function DokumenPage({ searchParams }: PageProps<"/desa/dokumen">) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const category = parseDokumenKategoriFilter(
    typeof params.kategori === "string" ? params.kategori : undefined,
  );
  const rawYear = typeof params.tahun === "string" ? Number(params.tahun) : Number.NaN;
  const year =
    Number.isInteger(rawYear) && rawYear >= 1900 && rawYear <= 2100 ? rawYear : undefined;
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100_000) : 1;

  const { ctx, tema, desa } = await siapkanTema();
  const result = await daftarDokumenPublik(desa.id, { search, category, year, page });
  const Dokumen = tema.dokumen;

  return (
    <Dokumen
      ctx={ctx}
      dokumen={result.rows}
      search={search}
      category={category}
      year={year}
      page={result.page}
      pageSize={result.pageSize}
      total={result.total}
    />
  );
}
