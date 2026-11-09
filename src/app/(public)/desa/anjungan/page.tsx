import { Monitor, MonitorOff } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cariPerangkatKiosk,
  daftarAnjunganPublik,
} from "@/features/anjungan/application/anjungan-use-cases";
import { AnjunganDeviceId } from "@/features/anjungan/presentation/components/anjungan-device-id";
import { tataLetakKiosk } from "@/features/anjungan/presentation/tata-letak-kiosk";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anjungan Mandiri",
  description: "Layanan mandiri anjungan digital desa.",
};

function ServiceCard({ item }: { item: { id: number; nama: string; deskripsi: string | null } }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center transition-colors hover:bg-accent/50">
      <CardHeader className="p-0">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Monitor className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-lg">{item.nama}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {item.deskripsi && <p className="text-sm text-muted-foreground">{item.deskripsi}</p>}
      </CardContent>
    </Card>
  );
}

export default async function AnjunganPublicPage() {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  // Perangkat kiosk dikenali dari UUID yang disimpan browser kiosk (cookie `anjungan_uuid`).
  const cookieStore = await cookies();
  const perangkat = await cariPerangkatKiosk(villageId, cookieStore.get("anjungan_uuid")?.value);

  // Show only active items, ordered by urutan then id
  const items = await daftarAnjunganPublik(villageId);
  const tata = tataLetakKiosk(perangkat?.orientasiLayar);

  return (
    <div className={`mx-auto ${tata.kelasLebar} px-4 py-8`}>
      <AnjunganDeviceId />
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Anjungan Mandiri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Layanan mandiri digital {identitas?.namaDesa ?? "desa"}
        </p>
        {perangkat ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Perangkat: {perangkat.nama} · Orientasi {tata.orientasi}
          </p>
        ) : null}
      </header>

      {items.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <MonitorOff className="h-10 w-10" />
            <p>Belum ada layanan mandiri aktif untuk desa ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={tata.kelasGrid}>
          {items.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
