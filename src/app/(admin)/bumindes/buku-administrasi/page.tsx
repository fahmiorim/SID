import type { Metadata } from "next";
import Link from "next/link";

import { getBumindesData } from "@/features/bumindes/presentation/actions";

export const metadata: Metadata = { title: "Buku Administrasi Desa" };

export default async function BukuAdministrasiPage() {
  const { buku } = await getBumindesData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buku Administrasi Desa</h1>
        <p className="text-muted-foreground">Buku-buku administrasi umum (parity dasar OpenSID).</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {buku.length === 0 ? (
          <div className="col-span-full rounded-lg border p-6 text-center text-muted-foreground">
            Belum ada data buku administrasi.
          </div>
        ) : (
          buku.map((b) => (
            <Link
              key={b.id}
              href={`/bumindes/buku-administrasi/${b.id}`}
              className="rounded-lg border p-4 hover:bg-accent/40"
            >
              <div className="font-medium">{b.namaBuku}</div>
              <div className="text-xs text-muted-foreground">Kode: {b.kodeBuku}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
