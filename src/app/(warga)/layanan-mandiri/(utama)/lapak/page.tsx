import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { daftarLapakWargaData } from "@/features/lapak/application/lapak-warga-use-cases";
import { LapakWargaManager } from "@/features/lapak/presentation/components/lapak-warga-manager";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Lapak Saya" };

export default async function LapakWargaPage() {
  await verifyWargaPage();
  const items = await daftarLapakWargaData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lapak Saya</h1>
        <p className="text-sm text-muted-foreground">
          Kelola usaha mikro Anda yang tampil pada katalog lapak desa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar lapak</CardTitle>
        </CardHeader>
        <CardContent>
          <LapakWargaManager items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
