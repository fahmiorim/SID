import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pemerintahan Desa" };

const PERANGKAT = [
  "Kepala Desa",
  "Sekretaris Desa",
  "Kaur Tata Usaha & Umum",
  "Kaur Keuangan",
  "Kaur Perencanaan",
  "Kasi Pemerintahan",
  "Kasi Kesejahteraan",
  "Kasi Pelayanan",
  "Kepala Dusun",
] as const;

export default async function PemerintahanPage() {
  const desa = await getIdentitasFromRequest();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Pemerintahan Desa</h1>
        <p className="text-muted-foreground">
          Susunan organisasi dan tata kerja (SOTK) {desa.namaDesa ?? "desa"}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kepala Desa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{desa.namaKepalaDesa ?? "Belum diatur"}</p>
          {desa.nipKepalaDesa ? (
            <p className="text-sm text-muted-foreground">NIP {desa.nipKepalaDesa}</p>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Perangkat Desa</h2>
        <p className="text-sm text-muted-foreground">
          Data perangkat beserta jabatan dan fotonya akan dikelola melalui panel admin (menu Konten
          → Perangkat).
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERANGKAT.map((jabatan) => (
            <li key={jabatan} className="rounded-lg border p-4">
              <p className="text-sm font-medium">{jabatan}</p>
              <p className="mt-1 text-xs text-muted-foreground">Belum ada data</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-muted-foreground">
        Butuh layanan administrasi?{" "}
        <Link href="/layanan-mandiri" className="text-primary underline-offset-4 hover:underline">
          Ajukan surat melalui Layanan Mandiri
        </Link>
        .
      </p>
    </div>
  );
}
