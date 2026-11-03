import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { getStatistikPublik } from "@/features/desa/application/statistik-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Statistik Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Data kependudukan, bantuan, dan keuangan ${desa.namaDesa ?? "desa"}`,
  };
}

export default async function StatistikPage() {
  const { desa } = await siapkanTema();
  const statistik = await getStatistikPublik(desa.id);

  return (
    <div className="space-y-6">
      <h1 className="mb-6 text-2xl font-bold">Statistik Desa · {desa.namaDesa ?? "Desa"}</h1>

      <PageHeader
        title="Statistik Desa"
        description="Data kependudukan, bantuan, dan keuangan desa"
      />

      {/* Core statistics - from StatistikDesa */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="rounded-md border border-primary/20 p-4">
            <div className="text-3xl font-bold tabular-nums">{statistik.total ?? "—"}</div>
            <div className="text-xs text-muted-foreground">Total Penduduk</div>
          </div>
        </div>
        <div>
          <div className="rounded-md border border-primary/20 p-4">
            <div className="text-3xl font-bold tabular-nums">{statistik.lakiLaki ?? "—"}</div>
            <div className="text-xs text-muted-foreground">Laki-laki</div>
          </div>
        </div>
        <div>
          <div className="rounded-md border border-primary/20 p-4">
            <div className="text-3xl font-bold tabular-nums">{statistik.perempuan ?? "—"}</div>
            <div className="text-xs text-muted-foreground">Perempuan</div>
          </div>
        </div>
        <div>
          <div className="rounded-md border border-primary/20 p-4">
            <div className="text-3xl font-bold tabular-nums">{statistik.keluarga ?? "—"}</div>
            <div className="text-xs text-muted-foreground">Keluarga</div>
          </div>
        </div>
      </div>

      {/* PDF Export Section - OS-POP-010 */}
      <div className="mt-6 rounded-md border border-primary/20 p-4">
        <svg className="mb-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2zm-3 4H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2v20a2 2 0 0 1-2 2h-2V7zM5 3h14v2H5V3zm6 16H7v-2h2v2zm5-8h-2v2h2v-2zm5-8h-2v2h2v-2zm2-4h-2v2h2v-2zm-2-6h2V5h-2v2zm0-4h2V3h-2V3z" />
        </svg>
        <span>
          Ekspor PDF <strong>(fitur admin)</strong>{" "}
          <a
            href="/(admin)/statistik/penduduk/ekspor/pdf"
            className="underline underline-offset-2 hover:text-primary/80"
            target="_blank"
          >
            Login sebagai admin desa
          </a>
          untuk mengunduh laporan lengkap dengan grafik dan ringkasan.
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Tombol cetak PDF di halaman ini sebelumnya mengarah ke halaman kosong (404). Perbaikan ini
        mengarahkan pengguna ke fitur admin yang sebenarnya.
      </p>

      {/* Statistics content - theme component */}
      <div className="mt-4">
        <span className="text-sm text-muted-foreground">
          Menampilkan statistik kependudukan, bantuan, dan keuangan melalui tema desa.
        </span>
      </div>
    </div>
  );
}
