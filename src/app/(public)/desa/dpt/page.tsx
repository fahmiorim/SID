import type { Metadata } from "next";
import Link from "next/link";

import { DEFAULT_DPT_PER_PAGE } from "@/features/penduduk/domain/dpt";
import { getActiveElection, listDpt } from "@/features/penduduk/infrastructure/dpt-repository";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

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

  const [election, result] = await Promise.all([
    getActiveElection(desa.id),
    listDpt(desa.id, { page, perPage: DEFAULT_DPT_PER_PAGE, search }),
  ]);

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `/desa/dpt?${qs}` : "/desa/dpt";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Daftar Pemilih Tetap</h1>
        <p className="text-sm text-muted-foreground">
          {desa.namaDesa ?? "Desa"}
          {election ? ` — ${election.judul} (${election.tanggal})` : " — belum ada pemilihan aktif"}
        </p>
      </header>

      <form className="flex gap-2" action="/desa/dpt">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari nama atau NIK"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md border px-4 py-2 text-sm font-medium">
          Cari
        </button>
      </form>

      {!election ? (
        <p className="text-sm text-muted-foreground">DPT belum tersedia.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">No</th>
                  <th className="p-2 text-left">NIK</th>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Jenis Kelamin</th>
                  <th className="p-2 text-left">Umur</th>
                  <th className="p-2 text-left">Dusun</th>
                  <th className="p-2 text-left">RW/RT</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, index) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-2">{(result.page - 1) * result.perPage + index + 1}</td>
                    <td className="p-2">{row.nationalId ?? "-"}</td>
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.gender === "male" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="p-2">{row.umurPemilihan ?? "-"}</td>
                    <td className="p-2">{row.dusun ?? "-"}</td>
                    <td className="p-2">
                      {row.rw ?? "-"}/{row.rt ?? "-"}
                    </td>
                  </tr>
                ))}
                {result.rows.length === 0 && (
                  <tr>
                    <td className="p-2 text-muted-foreground" colSpan={7}>
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{result.total} pemilih</span>
            <div className="flex items-center gap-2">
              {result.page > 1 && <Link href={pageHref(result.page - 1)}>Sebelumnya</Link>}
              <span>
                {result.page} / {result.pageCount}
              </span>
              {result.page < result.pageCount && (
                <Link href={pageHref(result.page + 1)}>Selanjutnya</Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
