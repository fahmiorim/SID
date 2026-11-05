import { FileCheck2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  daftarDokumenWargaData,
  listPermohonanWargaData,
} from "@/features/layanan-mandiri/application/warga-use-cases";
import { labelPermohonanStatus } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { DokumenWargaManager } from "@/features/layanan-mandiri/presentation/components/dokumen-warga-manager";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Dokumen Saya" };

export default async function DokumenWargaPage() {
  await verifyWargaPage();
  const [permohonan, dokumen] = await Promise.all([
    listPermohonanWargaData(),
    daftarDokumenWargaData(),
  ]);
  const surat = permohonan.filter((item) => item.letterId !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dokumen Saya</h1>
        <p className="text-sm text-muted-foreground">
          Arsip dokumen pribadi dan surat yang diterbitkan untuk Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Arsip Dokumen Pribadi</CardTitle>
          <CardDescription>
            Dokumen hanya dapat diunduh oleh akun Anda dan tidak tampil di situs publik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DokumenWargaManager dokumen={dokumen} />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">Surat Saya</h2>
        <p className="text-sm text-muted-foreground">
          Surat yang sudah dibuat operator dari permohonan Anda.
        </p>
      </div>

      {surat.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada dokumen surat. Ajukan surat terlebih dahulu.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {surat.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileCheck2 className="size-4 text-muted-foreground" />
                  {item.namaSurat ?? "Surat"}
                </CardTitle>
                <CardDescription>
                  {item.letterNumber ? `Nomor ${item.letterNumber}` : "Nomor belum tersedia"} ·{" "}
                  {labelPermohonanStatus(item.status)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {item.letterId && item.status >= 3 && item.status <= 4 ? (
                  <Button asChild size="sm">
                    <a
                      href={`/layanan-mandiri/surat/${item.letterId}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Unduh PDF
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Surat dapat diunduh setelah diterbitkan.
                  </p>
                )}

                {item.verificationToken ? (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/layanan-mandiri/verifikasi-surat?token=${encodeURIComponent(item.verificationToken)}`}
                    >
                      <ShieldCheck className="size-4" />
                      Verifikasi
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
