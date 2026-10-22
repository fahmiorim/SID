import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { keuanganTemplate, keuanganTriwulan } from "@/db/schema";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IDM & SDGs",
  description: "Laporan Keuangan Triwulan dan SDGs Desa",
};

export default async function IDMSDGsPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const { desa } = await siapkanTema();
  const villageId = desa.id;

  // Ambil tahun tersedia dari database
  const tahunRows = await db
    .select({ tahun: keuanganTriwulan.tahun })
    .from(keuanganTriwulan)
    .where(eq(keuanganTriwulan.villageId, villageId))
    .orderBy(keuanganTriwulan.tahun);

  const tahunTersedia = tahunRows.map((r) => r.tahun);
  const tahunDefault =
    tahunTersedia.length > 0 ? tahunTersedia[tahunTersedia.length - 1] : new Date().getFullYear();

  // Ambil parameter tahun dari search params
  const params = await searchParams;
  const tahunParam = params?.tahun ? Number(params.tahun) : undefined;
  const tahun = (tahunParam ?? tahunDefault) as number;

  // Ambil data triwulan
  const triwulanRows = await db
    .select({
      templateUuid: keuanganTriwulan.templateUuid,
      tw1: keuanganTriwulan.tw1,
      tw2: keuanganTriwulan.tw2,
      tw3: keuanganTriwulan.tw3,
      tw4: keuanganTriwulan.tw4,
    })
    .from(keuanganTriwulan)
    .where(and(eq(keuanganTriwulan.villageId, villageId), eq(keuanganTriwulan.tahun, tahun)));

  // Ambil template keuangan (uraian bidang)
  const templateRows = await db
    .select({
      uuid: keuanganTemplate.uuid,
      uraian: keuanganTemplate.uraian,
    })
    .from(keuanganTemplate);

  // Hitung total anggaran dan realisasi
  const totalAnggaran = triwulanRows.reduce(
    (sum: number, row: { tw1: string; tw2: string; tw3: string; tw4: string }) =>
      sum +
      (Number(row.tw1 ?? 0) + Number(row.tw2 ?? 0) + Number(row.tw3 ?? 0) + Number(row.tw4 ?? 0)),
    0,
  ) as number;
  const totalRealisasi = totalAnggaran;

  const persentase =
    totalAnggaran > 0 ? ((totalRealisasi / totalAnggaran) * 100).toFixed(2) : "0.00";

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">IDM & SDGs</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Laporan Triwulan Keuangan</h2>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Tahun</p>
            <p className="text-medium">
              {tahun} ({tahunTersedia.length} tersedia)
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Periode</p>
            <p className="text-medium">Triwulan I-IV</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            {tahunTersedia.map((t: number) => (
              <a
                key={t}
                href={`/desa/idm-sdgs?tahun=${t}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums ${t === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"}`}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>

      {templateRows.length > 0 ? (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-medium mb-4">Realisasi per Bidang</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-medium border border-border p-2 text-left">Bidang</th>
                  <th className="border border-border p-2 text-right tabular-nums">Anggaran</th>
                  <th className="border border-border p-2 text-right tabular-nums">TW I</th>
                  <th className="border border-border p-2 text-right tabular-nums">TW II</th>
                  <th className="border border-border p-2 text-right tabular-nums">TW III</th>
                  <th className="border border-border p-2 text-right tabular-nums">TW IV</th>
                  <th className="border border-border p-2 text-right tabular-nums">Total</th>
                  <th className="border border-border p-2 text-right tabular-nums">Realisasi</th>
                  <th className="border border-border p-2 text-right tabular-nums">%</th>
                </tr>
              </thead>
              <tbody>
                {templateRows.map((template) => {
                  const triwulanData = triwulanRows.find(
                    (row) => row.templateUuid === template.uuid,
                  );
                  const anggaran =
                    triwulanData != null
                      ? Number(triwulanData.tw1 ?? 0) +
                        Number(triwulanData.tw2 ?? 0) +
                        Number(triwulanData.tw3 ?? 0) +
                        Number(triwulanData.tw4 ?? 0)
                      : 0;
                  const realisasi = anggaran;
                  const persen = anggaran > 0 ? ((realisasi / anggaran) * 100).toFixed(2) : "0.00";

                  return (
                    <tr key={template.uuid}>
                      <td className="border border-border p-2 font-medium">
                        {template.uraian || "—"}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(anggaran)}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(Number(triwulanData?.tw1 ?? 0))}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(Number(triwulanData?.tw2 ?? 0))}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(Number(triwulanData?.tw3 ?? 0))}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(Number(triwulanData?.tw4 ?? 0))}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(anggaran)}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(realisasi)}
                      </td>
                      <td className="border border-border p-2 text-right tabular-nums">
                        {persen}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-muted-foreground">
            Belum ada data triwulan keuangan untuk desa ini. Silakan hubungi admin untuk memasukkan
            realisasi triwulan.
          </p>
        </div>
      )}

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Indikator SDGs</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-semibold mb-3">SDG 1: Kemiskinan</h3>
            <p className="text-sm text-muted-foreground">
              Alokasi sosial per triwulan:{" "}
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                totalAnggaran,
              )}
            </p>
            <p className="mt-2">
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                Target: {persentase}%
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-semibold mb-3">SDG 8: Ekonomi</h3>
            <p className="text-sm text-muted-foreground">
              Total realisasi triwulan:{" "}
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                totalRealisasi,
              )}
            </p>
            <p className="mt-2">
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                {persentase}% dari pagu
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
