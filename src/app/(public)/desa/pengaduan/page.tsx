import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaduan Warga",
  description: "Masukan dan pengaduan dari warga desa",
};

export default function PengaduanPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Pengaduan Warga</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Masukan Pengaduan</h2>

        <p className="text-sm text-muted-foreground">
          Silakan tuliskan pengaduan atau masukan Anda di bawah ini.
        </p>

        {/* TODO: Form pengaduan lengkap di Fase 3D */}
        <div className="rounded-border mt-4 bg-gray-50 p-4">
          <p className="text-muted-foreground">
            Form pengaduan akan segera tersedia. Terima kasih atas masukan Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
