import { Mail, MapPin, Menu, Phone } from "lucide-react";
import Link from "next/link";

import type { LayoutProps } from "@/themes/types";

/**
 * Struktur (header + footer) tema `natra`: header berwarna penuh dan footer
 * gelap, kontras dengan `esensi` yang serba terang.
 */
export function NatraLayout({ ctx, children }: LayoutProps) {
  const { desa, menu, tema, opsi } = ctx;
  const nama = desa.namaDesa ?? "Desa";

  return (
    <div data-theme="natra" className="flex min-h-full flex-col bg-background text-foreground">
      <header className="tema-natra-header sticky top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            {desa.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
              <img src={desa.logo} alt={`Logo ${nama}`} className="size-9 rounded object-contain" />
            ) : (
              <span className="flex size-9 items-center justify-center rounded bg-white/15 text-sm font-bold">
                {(nama.charAt(0) || "D").toUpperCase()}
              </span>
            )}
            <span className="max-w-44 truncate text-sm font-semibold sm:text-base">{nama}</span>
          </Link>

          {opsi.tampilMenu ? (
            <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Menu utama">
              {menu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium opacity-90 transition-opacity hover:opacity-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : (
            <div className="flex-1" />
          )}

          <Link
            href="/layanan-mandiri"
            className="hidden rounded-md bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur lg:inline-flex"
          >
            Layanan Mandiri
          </Link>

          {opsi.tampilMenu ? (
            <details className="relative lg:hidden">
              <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md bg-white/15">
                <Menu className="size-5" />
                <span className="sr-only">Menu {nama}</span>
              </summary>
              <nav
                className="absolute right-0 z-50 mt-2 w-64 rounded-lg border bg-background p-2 text-foreground shadow-lg"
                aria-label="Menu utama"
              >
                {menu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/layanan-mandiri"
                  className="mt-1 block rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent"
                >
                  Layanan Mandiri
                </Link>
              </nav>
            </details>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>

      <footer className="mt-auto bg-neutral-950 text-neutral-300">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">{nama}</h2>
            <p className="text-sm leading-relaxed text-neutral-400">
              Portal informasi resmi desa: berita, transparansi, data, dan layanan surat.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Tautan</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/desa/profil" className="hover:text-white">
                  Profil Desa
                </Link>
              </li>
              <li>
                <Link href="/desa/berita" className="hover:text-white">
                  Berita
                </Link>
              </li>
              <li>
                <Link href="/desa/apbdes" className="hover:text-white">
                  Transparansi APBDes
                </Link>
              </li>
              <li>
                <Link href="/layanan-mandiri" className="hover:text-white">
                  Layanan Mandiri
                </Link>
              </li>
            </ul>
          </div>

          {opsi.tampilKontakFooter ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Kontak</h2>
              <ul className="space-y-2 text-sm">
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
          ) : null}
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {new Date().getFullYear()} {nama} · {tema.nama}
            </p>
            <Link href="/masuk" className="hover:text-white">
              Masuk Pengelola
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
