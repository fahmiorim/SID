import { Monitor, MonitorOff } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAnjungan } from "@/features/anjungan/infrastructure/anjungan-repository";
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

  // Show only active items, ordered by urutan then id
  const items = await listAnjungan(villageId, true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Anjungan Mandiri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Layanan mandiri digital {identitas?.namaDesa ?? "desa"}
        </p>
      </header>

      {items.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <MonitorOff className="h-10 w-10" />
            <p>Belum ada layanan mandiri aktif untuk desa ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
