import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listPermohonanWargaData } from "@/features/layanan-mandiri/application/warga-use-cases";
import { verifikasiSuratPublik } from "@/features/surat/application/verifikasi-publik";
import { VERIFICATION_STEP_LABELS } from "@/features/surat/domain/surat";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Verifikasi Surat" };

export default async function VerifikasiSuratWargaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await verifyWargaPage();

  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";
  const hasil = token ? await verifikasiSuratPublik(token) : null;
  const surat = hasil?.surat ?? null;
  const permohonan = await listPermohonanWargaData();
  const suratSaya = permohonan.filter((item) => item.verificationToken);

  const langkah =
    surat?.status === "verifikasi"
      ? !surat.verifikasiOperator
        ? "operator"
        : !surat.verifikasiSekdes
          ? "sekdes"
          : "kades"
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verifikasi Surat</h1>
        <p className="text-sm text-muted-foreground">
          Periksa keaslian surat desa memakai token yang tercetak pada surat atau kode QR.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Cek token surat
          </CardTitle>
          <CardDescription>Token verifikasi terdiri dari 64 karakter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="token"
              defaultValue={token}
              required
              autoComplete="off"
              placeholder="Tempel token verifikasi di sini"
              aria-label="Token verifikasi"
            />
            <Button type="submit">Verifikasi</Button>
          </form>

          {token && !surat ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Surat dengan token tersebut tidak ditemukan di desa ini. Periksa kembali token yang
              Anda masukkan.
            </p>
          ) : null}

          {surat ? (
            <div className="space-y-3 rounded-lg border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {surat.typeName ?? "Surat"} {surat.year}
                </p>
                <Badge
                  variant={
                    surat.status === "issued"
                      ? "default"
                      : surat.status === "verifikasi"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {surat.status === "issued"
                    ? "Sudah terbit"
                    : surat.status === "verifikasi"
                      ? "Sedang diverifikasi"
                      : surat.status}
                </Badge>
              </div>

              <dl className="space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-muted-foreground">Nomor surat</dt>
                  <dd className="font-medium">{surat.number ?? "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-muted-foreground">Dibuat</dt>
                  <dd>{surat.createdAt.toLocaleDateString("id-ID")}</dd>
                </div>
                {langkah ? (
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-muted-foreground">Menunggu verifikasi</dt>
                    <dd>
                      {VERIFICATION_STEP_LABELS[langkah as keyof typeof VERIFICATION_STEP_LABELS]}
                    </dd>
                  </div>
                ) : null}
                {surat.catatanVerifikasi ? (
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-muted-foreground">Catatan</dt>
                    <dd>{surat.catatanVerifikasi}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Token surat Anda</h2>
        {suratSaya.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada surat milik Anda yang memiliki token verifikasi.
          </p>
        ) : (
          <div className="space-y-2">
            {suratSaya.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.namaSurat ?? "Surat"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.letterNumber ? `Nomor ${item.letterNumber}` : "Nomor belum tersedia"}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/layanan-mandiri/verifikasi-surat?token=${encodeURIComponent(item.verificationToken ?? "")}`}
                    >
                      Verifikasi
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
