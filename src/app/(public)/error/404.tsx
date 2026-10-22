import type { Metadata } from "next";
import Link from "next/link";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const _desa = await getIdentitasFromRequest();
  return {
    title: "Halaman Tidak Ditemukan",
    description: `Halaman yang Anda cari tidak tersedia di ${_desa.namaDesa ?? "Desa"} ini.`,
  };
}

export default async function Error404Page() {
  const _desa = await getIdentitasFromRequest();

  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <div className="max-w-md p-6">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
        <p className="mb-6 text-lg text-gray-600">Halaman tidak ditemukan</p>
        <p className="mb-8 text-gray-500">
          Halaman yang Anda cari mungkin telah dihapus, berubah nama, atau sementara tidak tersedia.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
