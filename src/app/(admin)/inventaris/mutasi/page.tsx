import type { Metadata } from "next";

import { getMutasiPageData } from "@/features/inventaris/application/inventaris-use-cases";

export const metadata: Metadata = { title: "Mutasi Inventaris" };

export default async function MutasiPage() {
  const { rows } = await getMutasiPageData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mutasi Inventaris</h1>
        <p className="text-muted-foreground">
          Pengajuan mutasi (pindah/rusak/hapus/perbaikan) & persetujuan.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Barang</th>
              <th className="p-2 text-left">Jenis</th>
              <th className="p-2 text-left">Tanggal</th>
              <th className="p-2 text-left">Alasan</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  Belum ada pengajuan mutasi.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">
                    {r.namaBarang} {r.nomorInventaris ? `(${r.nomorInventaris})` : ""}
                  </td>
                  <td className="p-2 capitalize">{r.jenis.replace("_", " ")}</td>
                  <td className="p-2">{r.tanggalMutasi}</td>
                  <td className="p-2">{r.alasan}</td>
                  <td className="p-2 capitalize">{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
