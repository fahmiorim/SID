import { Mail, MapPin, Phone } from "lucide-react";

import type { KontakProps } from "@/themes/types";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

/** Halaman kontak: alamat, telepon, email, dan jam pelayanan. */
export function EsensiKontak({ ctx }: KontakProps) {
  const desa = ctx.desa;

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Kontak"
        description={`Hubungi kantor ${desa.namaDesa ?? "desa"} untuk informasi dan layanan.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ThemeCard className="space-y-4 p-6 text-sm">
          <h2 className="text-base font-semibold">Alamat & Kontak</h2>
          <div className="flex gap-3">
            <MapPin className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.alamatKantor ?? "Alamat kantor desa belum diatur."}</span>
          </div>
          <div className="flex gap-3">
            <Phone className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.telepon ?? "Nomor telepon belum diatur."}</span>
          </div>
          <div className="flex gap-3">
            <Mail className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.emailDesa ?? "Email belum diatur."}</span>
          </div>
        </ThemeCard>

        <ThemeCard className="p-6 text-sm">
          <h2 className="text-base font-semibold">Jam Pelayanan</h2>
          <ul className="mt-4 space-y-2">
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
        </ThemeCard>
      </div>
    </div>
  );
}
