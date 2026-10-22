import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { urlMedia } from "@/features/publik/domain/format";
import { listPerangkatDesa } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pemerintahan Desa" };

function namaLengkap(nama: string, gelarDepan: string | null, gelarBelakang: string | null) {
  const depan = gelarDepan?.trim();
  const belakang = gelarBelakang?.trim();
  return [depan, nama, belakang].filter(Boolean).join(" ");
}

export default async function PemerintahanPage() {
  const desa = await getIdentitasFromRequest();
  const perangkat = await listPerangkatDesa(desa.id);

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
        {perangkat.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            Data perangkat desa belum diisi. Pengelola desa dapat menambahkannya melalui panel admin
            (menu Konten → Perangkat).
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perangkat.map((orang) => {
              const foto = urlMedia(orang.foto);
              return (
                <li key={orang.id} className="overflow-hidden rounded-xl border bg-card">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto}
                      alt={orang.nama}
                      className="aspect-square w-full object-cover"
                    />
                  ) : null}
                  <div className="p-4">
                    <p className="font-medium">
                      {namaLengkap(orang.nama, orang.gelarDepan, orang.gelarBelakang)}
                    </p>
                    <p className="text-sm text-primary">{orang.jabatan ?? "—"}</p>
                    {orang.nip ? (
                      <p className="mt-1 text-xs text-muted-foreground">NIP {orang.nip}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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
