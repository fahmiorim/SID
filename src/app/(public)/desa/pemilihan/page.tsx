import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { daftarPemilihanPublik } from "@/features/pemilihan/application/pemilihan-publik";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pemilihan Desa",
  description: "Jadwal dan riwayat pemilihan desa",
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Pemilihan Desa {identitas.namaDesa}</h1>
        <p className="text-sm text-muted-foreground">
          Jadwal dan riwayat penyelenggaraan pemilihan desa.
        </p>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada data pemilihan desa.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Tahun
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Jenis
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Tanggal
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{item.tahun}</td>
                      <td className="p-3">{item.jenis}</td>
                      <td className="p-3">{formatTanggal(item.tanggal)}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {item.keterangan || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
