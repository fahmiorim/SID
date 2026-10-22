import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import type { IdentitasDesa } from "@/features/desa/infrastructure/desa-repository";

export function PublicFooter({ desa }: { desa: IdentitasDesa }) {
  const tahun = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">{desa.namaDesa ?? "Desa"}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Portal informasi resmi desa untuk warga: berita, transparansi, data, dan layanan surat.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Tautan</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/desa/profil" className="hover:text-foreground">
                Profil Desa
              </Link>
            </li>
            <li>
              <Link href="/desa/berita" className="hover:text-foreground">
                Berita
              </Link>
            </li>
            <li>
              <Link href="/desa/apbdes" className="hover:text-foreground">
                Transparansi APBDes
              </Link>
            </li>
            <li>
              <Link href="/layanan-mandiri" className="hover:text-foreground">
                Layanan Mandiri
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Kontak</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{desa.alamatKantor ?? "Alamat belum diatur"}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <span>{desa.telepon ?? "Telepon belum diatur"}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <span>{desa.emailDesa ?? "Email belum diatur"}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {tahun} {desa.namaDesa ?? "Desa"}. Seluruh hak cipta dilindungi.
          </p>
          <Link href="/masuk" className="hover:text-foreground">
            Masuk Pengelola
          </Link>
        </div>
      </div>
    </footer>
  );
}
