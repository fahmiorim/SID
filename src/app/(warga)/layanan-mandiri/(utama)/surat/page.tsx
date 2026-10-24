import { ArrowLeft, FileText, Paperclip } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listJenisSuratWargaData,
  listPermohonanWargaData,
} from "@/features/layanan-mandiri/application/warga-use-cases";
import {
  labelPermohonanStatus,
  parseBerkasSyarat,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { FormAjukanSurat } from "@/features/layanan-mandiri/presentation/components/form-ajukan-surat";

export const metadata: Metadata = { title: "Ajukan Surat" };

function badgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 3) return "default";
  if (status === 4) return "outline";
  if (status === 0 || status === 5) return "destructive";
  return "secondary";
}

export default async function SuratWargaPage({
  searchParams,
}: PageProps<"/layanan-mandiri/surat">) {
  const params = await searchParams;
  const jenisId = Number(typeof params.jenis === "string" ? params.jenis : "");

  const [semuaJenis, riwayat] = await Promise.all([
    listJenisSuratWargaData(),
    listPermohonanWargaData(),
  ]);

  const dipilih = Number.isInteger(jenisId)
    ? (semuaJenis.find((item) => item.id === jenisId) ?? null)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {dipilih ? `Ajukan ${dipilih.nama}` : "Ajukan Surat"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dipilih
              ? "Lengkapi isian dan unggah seluruh syarat."
              : "Pilih jenis surat yang ingin diajukan."}
          </p>
        </div>
        {dipilih ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/layanan-mandiri/surat">
              <ArrowLeft className="size-4" />
              Pilih surat lain
            </Link>
          </Button>
        ) : null}
      </div>

      {dipilih ? (
        <Card>
          <CardHeader>
            <CardTitle>{dipilih.nama}</CardTitle>
            <CardDescription>Kode surat: {dipilih.kode}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAjukanSurat jenis={dipilih} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {semuaJenis.length === 0 ? (
            <Alert className="sm:col-span-2">
              <AlertDescription>
                Belum ada jenis surat aktif. Hubungi operator desa.
              </AlertDescription>
            </Alert>
          ) : (
            semuaJenis.map((jenis) => (
              <Card key={jenis.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 text-muted-foreground" />
                    {jenis.nama}
                  </CardTitle>
                  <CardDescription>Kode: {jenis.kode}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jenis.syarat.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Syarat:</p>
                      <ul className="mt-1 list-inside list-disc text-sm">
                        {jenis.syarat.map((syarat) => (
                          <li key={syarat.id}>{syarat.nama}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tanpa berkas syarat.</p>
                  )}
                  <Button asChild size="sm">
                    <Link href={`/layanan-mandiri/surat?jenis=${jenis.id}`}>Ajukan</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <section id="riwayat" className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Riwayat permohonan</h2>
          <p className="text-sm text-muted-foreground">
            Hanya permohonan milik akun Anda yang ditampilkan.
          </p>
        </div>

        {riwayat.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada permohonan.
          </p>
        ) : (
          <div className="space-y-3">
            {riwayat.map((item) => {
              const berkas = parseBerkasSyarat(item.syarat);
              return (
                <Card key={item.id}>
                  <CardContent className="space-y-2 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.namaSurat ?? "Surat"}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.noAntrian ?? "—"} ·{" "}
                          {item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "—"}
                        </p>
                      </div>
                      <Badge variant={badgeVariant(item.status)}>
                        {labelPermohonanStatus(item.status)}
                      </Badge>
                    </div>

                    {item.alasan ? (
                      <p className="rounded-lg bg-destructive/5 p-2 text-sm text-destructive">
                        Catatan operator: {item.alasan}
                      </p>
                    ) : null}

                    {berkas.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Paperclip className="size-3.5" />
                        {berkas.map((file) => (
                          <a
                            key={file.id}
                            href={`/layanan-mandiri/permohonan/${item.id}/syarat/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2 hover:text-foreground"
                          >
                            {file.nama}
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {item.letterNumber ? (
                      <p className="text-sm">
                        Nomor surat: <strong>{item.letterNumber}</strong>
                        {item.letterId ? (
                          <>
                            {" · "}
                            <a
                              className="underline underline-offset-2"
                              href={`/layanan-mandiri/surat/${item.letterId}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Unduh PDF
                            </a>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
