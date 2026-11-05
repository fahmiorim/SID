import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { daftarPemilihanPublik } from "@/features/pemilihan/application/pemilihan-publik";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pemilihan Desa",
  description: "Jadwal, kandidat, dan hasil pemilihan desa",
};

function formatTanggal(value: string | null) {
  if (!value) return "—";
  const tanggal = new Date(value);
  return Number.isNaN(tanggal.getTime()) ? value : tanggal.toLocaleDateString("id-ID");
}

export default async function PemilihanPublikPage() {
  const identitas = await getIdentitasFromRequest();
  if (!identitas?.id) notFound();

  const items = await daftarPemilihanPublik(identitas.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">Pemilihan Desa {identitas.namaDesa}</h1>
        <p className="text-sm text-muted-foreground">
          Jadwal, kandidat, dan rekapitulasi perolehan suara pemilihan desa.
        </p>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada data pemilihan desa.
          </CardContent>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
                {item.jenis} {item.tahun}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatTanggal(item.tanggal)} · {item.keterangan || "Tanpa keterangan"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.kandidat.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada kandidat yang didaftarkan.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full caption-bottom">
                      <thead>
                        <tr className="border-b">
                          <th className="w-14 p-3 text-left text-sm font-medium text-muted-foreground">
                            No
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                            Kandidat
                          </th>
                          <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                            Suara
                          </th>
                          <th className="w-20 p-3 text-right text-sm font-medium text-muted-foreground">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.rekap.rows.map((kandidat) => (
                          <tr key={kandidat.id} className="border-b last:border-0">
                            <td className="p-3 tabular-nums">{kandidat.nomorUrut}</td>
                            <td className="p-3">
                              <p className="font-medium">{kandidat.nama}</p>
                              {kandidat.keterangan ? (
                                <p className="text-xs text-muted-foreground">
                                  {kandidat.keterangan}
                                </p>
                              ) : null}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {kandidat.jumlahSuara.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-right tabular-nums">{kandidat.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total suara sah: {item.rekap.totalSuara.toLocaleString("id-ID")} · Pemenang:{" "}
                    {item.rekap.pemenang ?? "belum ditetapkan"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
