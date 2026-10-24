import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPermohonanWargaData } from "@/features/layanan-mandiri/application/warga-use-cases";
import { labelPermohonanStatus } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Pesan" };

function badgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 3) return "default";
  if (status === 4) return "outline";
  if (status === 0 || status === 5) return "destructive";
  return "secondary";
}

export default async function PesanWargaPage() {
  await verifyWargaPage();
  const permohonan = await listPermohonanWargaData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pesan</h1>
        <p className="text-sm text-muted-foreground">
          Catatan operator dan perkembangan permohonan Anda.
        </p>
      </div>

      {permohonan.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada pesan.
        </p>
      ) : (
        <div className="space-y-3">
          {permohonan.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{item.namaSurat ?? "Surat"}</p>
                  </div>
                  <Badge variant={badgeVariant(item.status)}>
                    {labelPermohonanStatus(item.status)}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {item.noAntrian ?? "—"} ·{" "}
                  {item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "—"}
                </p>

                <p className="text-sm">
                  {item.alasan
                    ? item.alasan
                    : item.status === 0
                      ? "Berkas perlu dilengkapi. Silakan periksa catatan operator."
                      : `Status permohonan: ${labelPermohonanStatus(item.status)}.`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
