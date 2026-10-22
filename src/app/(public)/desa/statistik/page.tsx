import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistik Desa",
  description: "Statistik lengkap desa: penduduk, bantuan, keuangan",
};

export default function StatistikPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Statistik Desa</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Penduduk */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 text-3xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Total Penduduk</div>
        </div>

        {/* Bantuan */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 text-3xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Penerima Bantuan</div>
        </div>

        {/* Keuangan */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 text-3xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Anggaran (Rp)</div>
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Rincian Statistik</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Laki-laki</p>
            <p className="text-medium"></p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Perempuan</p>
            <p className="text-medium"></p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Anak Usia Dini</p>
            <p className="text-medium"></p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lansia</p>
            <p className="text-medium"></p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Data statistik akan lengkap segera. Silakan hubungi admin untuk informasi lebih lanjut.
        </p>
      </div>
    </div>
  );
}
