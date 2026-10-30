import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IDM & SDGs Desa",
  description: "Indeks Desa Membangun dan SDGs Desa",
};

export default function IdmSdgsPage() {
  return (
    <div className="mx-auto max-w-4xl py-12">
      <h1 className="mb-6 text-2xl font-bold">IDM & SDGs Desa</h1>
      <p className="text-sm text-muted-foreground">
        Data status desa, IDM, dan SDGs akan ditampilkan di sini.
      </p>
    </div>
  );
}
