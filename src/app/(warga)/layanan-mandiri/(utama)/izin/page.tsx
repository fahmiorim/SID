import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { daftarIzinWargaData } from "@/features/kehadiran/application/izin-use-cases";
import { IzinWargaManager } from "@/features/kehadiran/presentation/components/izin-warga-manager";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Izin & Cuti" };

export default async function IzinWargaPage() {
  await verifyWargaPage();
  const items = await daftarIzinWargaData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Izin & Cuti</h1>
        <p className="text-sm text-muted-foreground">
          Ajukan izin, sakit, atau cuti dan pantau keputusan operator desa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengajuan baru</CardTitle>
          <CardDescription>Pengajuan akan diperiksa operator kehadiran desa.</CardDescription>
        </CardHeader>
        <CardContent>
          <IzinWargaManager items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
