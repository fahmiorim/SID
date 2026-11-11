import { ArrowLeft, FileText, LogOut } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cariPerangkatKiosk } from "@/features/anjungan/application/anjungan-use-cases";
import {
  bacaSesiGuestKioskData,
  daftarJenisSuratKioskData,
  daftarPermohonanKioskData,
  getJenisSuratKioskData,
} from "@/features/anjungan/application/kiosk-use-cases";
import { KIOSK_GUEST_COOKIE } from "@/features/anjungan/domain/kiosk-guest";
import { KioskLoginForm } from "@/features/anjungan/presentation/components/kiosk-login-form";
import { ANJUNGAN_UUID_COOKIE } from "@/features/anjungan/presentation/device-uuid";
import {
  ajukanSuratKioskAction,
  keluarKioskAction,
} from "@/features/anjungan/presentation/kiosk-actions";
import { tataLetakKiosk } from "@/features/anjungan/presentation/tata-letak-kiosk";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { labelPermohonanStatus } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { FormAjukanSurat } from "@/features/layanan-mandiri/presentation/components/form-ajukan-surat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permohonan Surat Anjungan",
  description: "Ajukan surat mandiri lewat anjungan desa tanpa akun.",
};

const JALUR_PERMOHONAN = "/desa/anjungan/permohonan";

function badgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 3) return "default";
  if (status === 4) return "outline";
  if (status === 0 || status === 5) return "destructive";
  return "secondary";
}

export default async function AnjunganPermohonanPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string | string[] }>;
}) {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const cookieStore = await cookies();
  const perangkat = await cariPerangkatKiosk(
    villageId,
    cookieStore.get(ANJUNGAN_UUID_COOKIE)?.value,
  );

  // Hanya perangkat kiosk terdaftar yang mengizinkan permohonan tanpa akun.
  if (!perangkat || perangkat.permohonanSuratTanpaAkun !== 1) notFound();

  const sesi = await bacaSesiGuestKioskData(
    villageId,
    perangkat,
    cookieStore.get(KIOSK_GUEST_COOKIE)?.value,
  );
  const tata = tataLetakKiosk(perangkat.orientasiLayar);

  if (!sesi) {
    return (
      <div className={`mx-auto ${tata.kelasLebar} px-4 py-8`}>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/desa/anjungan">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verifikasi identitas</CardTitle>
            <CardDescription>
              Masukkan NIK dan tanggal lahir Anda. Data warga desa {identitas?.namaDesa ?? ""}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KioskLoginForm keyboardAktif={perangkat.keyboard === 1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const params = await searchParams;
  const jenisRaw = typeof params.jenis === "string" ? params.jenis.trim() : "";
  const jenisId = jenisRaw === "" ? null : Number(jenisRaw);

  if (jenisId !== null && (!Number.isInteger(jenisId) || jenisId < 1)) notFound();

  const dipilih =
    jenisId === null ? null : await getJenisSuratKioskData(villageId, perangkat, jenisId);

  if (jenisId !== null && !dipilih) notFound();

  const semuaJenis = dipilih ? [] : await daftarJenisSuratKioskData(villageId, perangkat);
  const riwayat = dipilih ? [] : await daftarPermohonanKioskData(villageId, perangkat, sesi);

  return (
    <div className={`mx-auto ${tata.kelasLebar} px-4 py-8`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {dipilih ? `Ajukan ${dipilih.nama}` : "Permohonan Surat"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Atas nama <strong>{sesi.nama}</strong> · Perangkat {perangkat.nama}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={dipilih ? JALUR_PERMOHONAN : "/desa/anjungan"}>
              <ArrowLeft className="size-4" />
              {dipilih ? "Pilih surat lain" : "Beranda"}
            </Link>
          </Button>
          <form action={keluarKioskAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" />
              Selesai
            </Button>
          </form>
        </div>
      </div>

      {dipilih ? (
        <Card>
          <CardHeader>
            <CardTitle>{dipilih.nama}</CardTitle>
            <CardDescription>Kode surat: {dipilih.kode}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAjukanSurat
              jenis={dipilih}
              action={ajukanSuratKioskAction}
              tautanRiwayat={`${JALUR_PERMOHONAN}#riwayat`}
              tautanAjukanLain={JALUR_PERMOHONAN}
              printer={perangkat.ipAddressPortPrinter}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className={tata.kelasGrid}>
            {semuaJenis.length === 0 ? (
              <Alert className="sm:col-span-2">
                <AlertDescription>
                  Belum ada jenis surat aktif. Hubungi operator desa.
                </AlertDescription>
              </Alert>
            ) : (
              semuaJenis.map((jenis) => (
                <Card key={jenis.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="size-4 text-muted-foreground" />
                      {jenis.nama}
                    </CardTitle>
                    <CardDescription>Kode: {jenis.kode}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    {jenis.syarat.length > 0 ? (
                      <ul className="list-inside list-disc text-sm">
                        {jenis.syarat.map((syarat) => (
                          <li key={syarat.id}>{syarat.nama}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tanpa berkas syarat.</p>
                    )}
                    <Button asChild size="sm">
                      <Link href={`${JALUR_PERMOHONAN}?jenis=${jenis.id}`}>Ajukan</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <section id="riwayat" className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Riwayat permohonan</h2>

            {riwayat.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada permohonan atas nama Anda.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {riwayat.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="space-y-2 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.namaSurat ?? "Surat"}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.noAntrian ?? "—"} ·{" "}
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString("id-ID")
                              : "—"}
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
                      {item.letterNumber ? (
                        <p className="text-sm">
                          Nomor surat: <strong>{item.letterNumber}</strong>
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
