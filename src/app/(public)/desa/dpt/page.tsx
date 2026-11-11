import type { Metadata } from "next";
import Link from "next/link";

import { getDptPublik } from "@/features/penduduk/application/dpt-use-cases";
import { DEFAULT_DPT_PER_PAGE } from "@/features/penduduk/domain/dpt";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return { title: `DPT · ${desa.namaDesa ?? "Desa"}` };
}

export default async function DptPublikPage({ searchParams }: PageProps<"/desa/dpt">) {
  const { desa } = await siapkanTema();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = typeof params.search === "string" ? params.search.trim() : "";

  const { election, result } = await getDptPublik(desa.id, {
    page,
    perPage: DEFAULT_DPT_PER_PAGE,
    search,
  });

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `/desa/dpt?${qs}` : "/desa/dpt";
  };

  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Daftar Pemilih Tetap"
        description={
          election
            ? `${desa.namaDesa ?? "Desa"} — ${election.judul} (${election.tanggal})`
            : `${desa.namaDesa ?? "Desa"} — belum ada pemilihan aktif`
        }
      />

      <form className="flex gap-2" action="/desa/dpt">
        <label htmlFor="dpt-search" className="sr-only">
          Cari nama pemilih
        </label>
        <input
          id="dpt-search"
          name="search"
          defaultValue={search}
          placeholder="Cari nama pemilih"
          className="min-h-11 w-full rounded-[var(--pub-radius)] border bg-card px-3 text-sm"
        />
        <button
          type="submit"
          className="min-h-11 rounded-[var(--pub-radius)] border px-4 text-sm font-medium hover:bg-muted"
        >
          Cari
        </button>
      </form>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Untuk melindungi data pribadi, daftar publik hanya memuat nama dan wilayah. NIK hanya dapat
        dilihat petugas melalui area pengelola.
      </p>

      {!election ? (
        <p className="text-sm text-muted-foreground">DPT belum tersedia.</p>
      ) : (
        <>
          <ThemeCard className="overflow-hidden">
            <ul className="divide-y md:hidden">
              {result.rows.map((row, index) => (
                <li key={row.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="leading-snug font-medium">{row.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        No. {(result.page - 1) * result.perPage + index + 1}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
                      {row.umurPemilihan ?? "-"} tahun
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Jenis kelamin</dt>
                      <dd className="mt-0.5 font-medium">
                        {row.gender === "male" ? "Laki-laki" : "Perempuan"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Dusun</dt>
                      <dd className="mt-0.5 font-medium">{row.dusun ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">RW/RT</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {row.rw ?? "-"}/{row.rt ?? "-"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
              {result.rows.length === 0 && (
                <li className="px-4 py-8 text-center text-muted-foreground">Tidak ada data.</li>
              )}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">No</th>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Jenis Kelamin</th>
                    <th className="px-4 py-3 font-medium">Umur</th>
                    <th className="px-4 py-3 font-medium">Dusun</th>
                    <th className="px-4 py-3 font-medium">RW/RT</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-4 py-3">
                        {(result.page - 1) * result.perPage + index + 1}
                      </td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3">
                        {row.gender === "male" ? "Laki-laki" : "Perempuan"}
                      </td>
                      <td className="px-4 py-3">{row.umurPemilihan ?? "-"}</td>
                      <td className="px-4 py-3">{row.dusun ?? "-"}</td>
                      <td className="px-4 py-3">
                        {row.rw ?? "-"}/{row.rt ?? "-"}
                      </td>
                    </tr>
                  ))}
                  {result.rows.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ThemeCard>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{result.total} pemilih</span>
            <div className="flex items-center gap-3">
              {result.page > 1 && (
                <Link
                  href={pageHref(result.page - 1)}
                  className="tema-link-primary font-medium hover:underline"
                >
                  Sebelumnya
                </Link>
              )}
              <span className="tabular-nums">
                {result.page} / {result.pageCount}
              </span>
              {result.page < result.pageCount && (
                <Link
                  href={pageHref(result.page + 1)}
                  className="tema-link-primary font-medium hover:underline"
                >
                  Selanjutnya
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
