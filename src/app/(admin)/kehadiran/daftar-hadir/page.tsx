import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { listKehadiranAction } from "@/features/kehadiran/presentation/kehadiran-actions";

export const metadata = { title: "Daftar Hadir" };

export default async function DaftarHadirPage() {
  const items = await listKehadiranAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Daftar Hadir" description="Rekap daftar hadir perangkat desa" />
      <Card>
        <CardContent className="p-6">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data kehadiran.</p>
          ) : (
            <dl className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <dt className="font-medium">
                    {item.perangkatNama ?? "Perangkat"} - {item.tanggal}
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    Masuk: {item.jamMasuk ?? "-"} | Keluar: {item.jamKeluar ?? "-"} | {item.status}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
