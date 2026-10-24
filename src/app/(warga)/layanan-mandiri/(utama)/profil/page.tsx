import { KeyRound, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GENDER_LABELS } from "@/features/penduduk/domain/penduduk";
import { getProfilWargaData } from "@/features/warga/application/warga-use-cases";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Profil Warga" };

function tanggal(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ProfilWargaPage() {
  const user = await verifyWargaPage();
  const profile = await getProfilWargaData();

  const baris = [
    ["Nama lengkap", profile.name],
    ["NIK", profile.nationalId ?? "—"],
    ["Jenis kelamin", GENDER_LABELS[profile.gender]],
    ["Tempat, tanggal lahir", `${profile.birthPlace ?? "—"}, ${tanggal(profile.birthDate)}`],
    ["Nomor KK", profile.familyNumber ?? "—"],
    ["Wilayah", profile.regionLabel ?? "—"],
    ["Alamat", profile.address ?? "—"],
    ["Nomor HP", profile.phone ?? "—"],
    ["Username", user.username ?? "—"],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">
            Data kependudukan yang dipakai untuk pengajuan surat.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/layanan-mandiri/ubah-pin">
            <KeyRound className="size-4" />
            Ubah PIN
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4" />
            Data warga
          </CardTitle>
          <CardDescription>
            Jika ada data yang tidak sesuai, hubungi operator desa untuk memperbarui data induk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {baris.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
