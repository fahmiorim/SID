import type { Metadata } from "next";

import { listPertanahanPublik } from "@/features/publik/application/pertanahan-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa, ctx } = await siapkanTema();
  void ctx;

  return {
    title: `Pertanahan · ${desa.namaDesa ?? "Desa"}`,
    description: `Data pertanahan dan persil di desa ${desa.namaDesa ?? "desa"}`,
  };
}

export default async function PertanahanPage() {
  const { desa } = await siapkanTema();
  const data = await listPertanahanPublik(desa.id);

  return (
    <div className="mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-2xl font-bold">Data Pertanahan</h1>

      {/* Persil */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Persil Tanah</h2>
        {data.persil.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data persil.</p>
        ) : (
          <div className="overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">No. Persil</th>
                  <th className="px-4 py-2 text-left">No. Cdesa</th>
                  <th className="px-4 py-2 text-right">Luas (m²)</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {data.persil.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.nomor}</td>
                    <td className="px-4 py-2">{p.nomorCdesa ?? "—"}</td>
                    <td className="px-4 py-2 text-right">
                      {p.luas?.toLocaleString("id-ID") ?? "—"}
                    </td>
                    <td className="px-4 py-2">{p.status ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.keterangan ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cdesa / Sertifikat */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Cdesa / Sertifikat</h2>
        {data.cdesa.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data Cdesa.</p>
        ) : (
          <div className="overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">No. Cdesa</th>
                  <th className="px-4 py-2 text-left">No. Persil</th>
                  <th className="px-4 py-2 text-left">No. Sertifikat</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Pemegang</th>
                  <th className="px-4 py-2 text-right">Luas (m²)</th>
                  <th className="px-4 py-2 text-left">Ket.</th>
                </tr>
              </thead>
              <tbody>
                {data.cdesa.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{c.nomor}</td>
                    <td className="px-4 py-2">{c.nomorPersil ?? "—"}</td>
                    <td className="px-4 py-2">{c.nomorSertifikat ?? "—"}</td>
                    <td className="px-4 py-2">
                      {c.tanggal ? new Date(c.tanggal).toLocaleDateString("id-ID") : "—"}
                    </td>
                    <td className="px-4 py-2">{c.namaPemegang ?? "—"}</td>
                    <td className="px-4 py-2 text-right">
                      {c.luas?.toLocaleString("id-ID") ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{c.keterangan ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Mutasi */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Mutasi</h2>
        {data.mutasi.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data mutasi.</p>
        ) : (
          <div className="overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">No.</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Tipe</th>
                  <th className="px-4 py-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {data.mutasi.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2">{m.nomor}</td>
                    <td className="px-4 py-2">{m.tanggal.toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-2">{m.tipe}</td>
                    <td className="px-4 py-2 text-muted-foreground">{m.keterangan ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// Terintegrasi dengan data GIS persil, cdesa, dan mutasi
