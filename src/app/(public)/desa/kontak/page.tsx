import { Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export const metadata = { title: "Kontak Desa" };

export default async function KontakPage() {
  const desa = await getIdentitasFromRequest();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Kontak</h1>
        <p className="text-muted-foreground">
          Hubungi kantor {desa.namaDesa ?? "desa"} untuk informasi dan layanan.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alamat & Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{desa.alamatKantor ?? "Alamat kantor desa belum diatur."}</span>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{desa.telepon ?? "Nomor telepon belum diatur."}</span>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{desa.emailDesa ?? "Email belum diatur."}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jam Pelayanan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Senin – Kamis</span>
                <span>08.00 – 15.00 WIB</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Jumat</span>
                <span>08.00 – 11.00 WIB</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sabtu – Minggu</span>
                <span>Tutup</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
