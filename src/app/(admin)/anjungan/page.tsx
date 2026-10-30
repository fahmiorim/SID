import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { listAnjunganAction } from "@/features/anjungan/presentation/anjungan-actions";

export const metadata = { title: "Anjungan Desa" };

export default async function AnjunganPage() {
  const items = await listAnjunganAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Anjungan Desa" description="Kelola anjungan/layanan mandiri desa" />
      <Card>
        <CardContent className="p-6">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data anjungan.</p>
          ) : (
            <dl className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <dt className="font-medium">{item.nama}</dt>
                  <dd className="text-sm text-muted-foreground">{item.deskripsi ?? "-"}</dd>
                  <dd className="text-xs text-muted-foreground">
                    Status: {item.aktif ? "Aktif" : "Nonaktif"} | Urutan: {item.urutan}
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
