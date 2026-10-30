import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listIdm } from "@/features/idm/infrastructure/idm-repository";

export const metadata = { title: "IDM & SDGs Desa" };

export default async function IdmSdgsPublicPage() {
  const desa = await getIdentitasFromRequest();
  const tahun = new Date().getFullYear();
  const indikatorList = await listIdm(desa.id, tahun);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indeks Desa Membangun (IDM) & SDGs"
        description={`Capaian IDM dan SDGs ${desa.namaDesa ?? "Desa"}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Indikator IDM Tahun {tahun}</CardTitle>
        </CardHeader>
        <CardContent>
          {indikatorList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data IDM yang dipublikasikan untuk tahun {tahun}.
            </p>
          ) : (
            <div className="space-y-3">
              {indikatorList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {item.kode}
                    </span>
                    <span className="font-medium">{item.nama}</span>
                    {item.keterangan ? (
                      <p className="text-sm text-muted-foreground">{item.keterangan}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{item.skor ?? "-"}</span>
                    {item.kategori ? (
                      <span className="block text-xs text-muted-foreground">{item.kategori}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
