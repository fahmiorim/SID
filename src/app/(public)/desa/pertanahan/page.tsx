import type { Metadata } from "next";

import { listPertanahanPublik } from "@/features/publik/application/pertanahan-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa, ctx } = await siapkanTema();
  void ctx;

  return {
    title: `Pertanahan · ${desa.namaDesa ?? "Desa"}`,
    description: `Data pertanahan dan persil di desa ${desa.namaDesa ?? "desa"}`,
  };
}

function formatTanggal(tanggal: string | Date | null) {
  if (!tanggal) return "—";
  const nilai = new Date(tanggal);
  return Number.isNaN(nilai.getTime()) ? "—" : nilai.toLocaleDateString("id-ID");
}

function formatLuas(luas: number) {
  return `${luas.toLocaleString("id-ID")} m²`;
}

export default async function PertanahanPage() {
  const { desa } = await siapkanTema();
  const data = await listPertanahanPublik(desa.id);

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Data Pertanahan"
        description="Data persil, Cdesa/sertifikat, dan mutasi tanah yang tercatat di desa."
      />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Persil Tanah</h2>
        {data.persil.length === 0 ? (
          <ThemeEmpty>Belum ada data persil.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <ul className="divide-y md:hidden">
              {data.persil.map((p) => (
                <li key={p.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-xs break-all">{p.nomor}</p>
                    {p.status ? (
                      <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium">
                        {p.status}
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">No. Cdesa</dt>
                      <dd className="mt-0.5 font-medium">{p.nomorCdesa ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Luas</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">{formatLuas(p.luas)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Keterangan</dt>
                      <dd className="mt-0.5 font-medium">{p.keterangan ?? "—"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      No. Persil
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      No. Cdesa
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Luas (m²)
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.persil.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs">{p.nomor}</td>
                      <td className="px-4 py-3">{p.nomorCdesa ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatLuas(p.luas)}</td>
                      <td className="px-4 py-3">{p.status ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.keterangan ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Cdesa / Sertifikat</h2>
        {data.cdesa.length === 0 ? (
          <ThemeEmpty>Belum ada data Cdesa.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <ul className="divide-y md:hidden">
              {data.cdesa.map((c) => (
                <li key={c.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-xs break-all">{c.nomor}</p>
                    <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
                      {formatTanggal(c.tanggal)}
                    </span>
                  </div>
                  {c.namaPemegang ? (
                    <p className="mt-2 leading-snug font-medium">{c.namaPemegang}</p>
                  ) : null}
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">No. Persil</dt>
                      <dd className="mt-0.5 font-medium">{c.nomorPersil ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">No. Sertifikat</dt>
                      <dd className="mt-0.5 font-medium">{c.nomorSertifikat ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Luas</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">{formatLuas(c.luas)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Keterangan</dt>
                      <dd className="mt-0.5 font-medium">{c.keterangan ?? "—"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[840px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      No. Cdesa
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      No. Persil
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      No. Sertifikat
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Tanggal
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Pemegang
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Luas (m²)
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Ket.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.cdesa.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs">{c.nomor}</td>
                      <td className="px-4 py-3">{c.nomorPersil ?? "—"}</td>
                      <td className="px-4 py-3">{c.nomorSertifikat ?? "—"}</td>
                      <td className="px-4 py-3">{formatTanggal(c.tanggal)}</td>
                      <td className="px-4 py-3">{c.namaPemegang ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatLuas(c.luas)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.keterangan ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Mutasi</h2>
        {data.mutasi.length === 0 ? (
          <ThemeEmpty>Belum ada data mutasi.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <ul className="divide-y md:hidden">
              {data.mutasi.map((m) => (
                <li key={m.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-xs break-all">{m.nomor}</p>
                    <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium">
                      {m.tipe}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatTanggal(m.tanggal)}</p>
                  <p className="mt-2 text-sm">{m.keterangan ?? "—"}</p>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      No.
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Tanggal
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Tipe
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.mutasi.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs">{m.nomor}</td>
                      <td className="px-4 py-3">{formatTanggal(m.tanggal)}</td>
                      <td className="px-4 py-3">{m.tipe}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.keterangan ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>
    </div>
  );
}
