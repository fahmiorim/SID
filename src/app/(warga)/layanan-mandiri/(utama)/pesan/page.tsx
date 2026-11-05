import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPermohonanWargaData } from "@/features/layanan-mandiri/application/warga-use-cases";
import { labelPermohonanStatus } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { daftarPesanWargaData } from "@/features/pesan-warga/application/pesan-warga-use-cases";
import { labelPengirimPesan } from "@/features/pesan-warga/domain/pesan-warga";
import { PesanWargaForm } from "@/features/pesan-warga/presentation/components/pesan-warga-form";
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
  const [pesan, permohonan] = await Promise.all([
    daftarPesanWargaData(),
    listPermohonanWargaData(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pesan</h1>
        <p className="text-sm text-muted-foreground">
          Percakapan dua arah dengan operator desa, serta perkembangan permohonan Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4 text-muted-foreground" />
            Percakapan dengan operator
          </CardTitle>
          <CardDescription>
            Balasan operator akan muncul di halaman ini beserta penanda sudah dibaca.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pesan.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada percakapan. Kirim pesan pertama Anda di bawah.
            </p>
          ) : (
            <ul className="space-y-3">
              {pesan.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.pengirim === "warga"
                      ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                      : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2"
                  }
                >
                  <p className="text-xs font-medium opacity-80">
                    {labelPengirimPesan(item.pengirim)}
                  </p>
                  <p className="text-sm whitespace-pre-line">{item.isi}</p>
                  <p className="mt-1 text-[11px] opacity-70">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <PesanWargaForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Perkembangan permohonan</h2>
        {permohonan.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada permohonan surat.
          </p>
        ) : (
          <div className="space-y-3">
            {permohonan.map((item) => (
              <Card key={item.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.namaSurat ?? "Surat"}</p>
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
      </section>
    </div>
  );
}
