import type { Metadata } from "next";

import { getLayananMandiriData } from "@/features/layanan-mandiri/presentation/actions";

export const metadata: Metadata = { title: "Permohonan Surat" };

export default async function PermohonanSuratPage() {
  const { permohonan } = await getLayananMandiriData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Permohonan Surat</h1>
        <p className="text-muted-foreground">
          Permohonan surat yang diajukan warga melalui layanan mandiri.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">No. Antrian</th>
              <th className="p-2 text-left">Pemohon</th>
              <th className="p-2 text-left">Surat</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Tgl</th>
            </tr>
          </thead>
          <tbody>
            {permohonan.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  Belum ada permohonan.
                </td>
              </tr>
            ) : (
              permohonan.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.noAntrian || "-"}</td>
                  <td className="p-2">{p.namaPemohon || "-"}</td>
                  <td className="p-2">{p.namaSurat || "-"}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("id-ID") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
