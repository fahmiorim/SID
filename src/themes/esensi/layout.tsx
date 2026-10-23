import { Mail, MapPin, Menu, Phone } from "lucide-react";
import Link from "next/link";

import type { LayoutProps } from "@/themes/types";
import { ThemeButton } from "@/themes/ui";

/**
 * Struktur (header + footer) tema `esensi`.
 *
 * Layout menerima `ctx.menu` dari `menu_publik` (atau menu statis bawaan) dan
 * `ctx.desa` untuk identitas. Opsi tema mengatur varian header serta tampil atau
 * sembunyinya blok kontak di footer.
 */
export function EsensiLayout({ ctx, children }: LayoutProps) {
  const { desa, menu, tema } = ctx;
  const nama = desa.namaDesa ?? "Desa";
  const logo = desa.logo;
  const opsi = ctx.opsi;

  return (
    <div
      data-theme="esensi"
      className="flex min-h-full flex-col bg-background text-foreground"
      style={{ fontFamily: "var(--pub-font)" }}
    >
      <header
        data-varian={opsi.headerVarian}
        className="tema-esensi-header sticky top-0 z-40 border-b backdrop-blur"
        style={{ backgroundColor: "color-mix(in srgb, var(--background) 92%, transparent)" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
              <img src={logo} alt={`Logo ${nama}`} className="size-9 rounded object-contain" />
            ) : (
              <span
                className="flex size-9 items-center justify-center rounded text-sm font-bold"
                style={{
                  backgroundColor: "var(--pub-primary)",
                  color: "var(--pub-primary-foreground)",
                }}
              >
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
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : (
            <div className="flex-1" />
          )}

          <ThemeButton href="/layanan-mandiri" variant="primary">
            Layanan Mandiri
          </ThemeButton>

          <MobileMenu nama={nama} menu={menu} tampilMenu={opsi.tampilMenu} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>

      <footer className="tema-esensi-footer mt-auto border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {nama} · {tema.nama}
          </p>
          {opsi.tampilKontakFooter ? (
            <ul className="flex flex-wrap items-center gap-4">
              {desa.alamatKantor ? (
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  <span className="line-clamp-1">{desa.alamatKantor}</span>
                </li>
              ) : null}
              {desa.telepon ? (
                <li className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {desa.telepon}
                </li>
              ) : null}
              {desa.emailDesa ? (
                <li className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {desa.emailDesa}
                </li>
              ) : null}
            </ul>
          ) : (
            <Link href="/masuk" className="hover:text-foreground">
              Masuk Pengelola
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

function MobileMenu({
  nama,
  menu,
  tampilMenu,
}: {
  nama: string;
  menu: LayoutProps["ctx"]["menu"];
  tampilMenu: boolean;
}) {
  if (!tampilMenu) return null;

  return (
    <details className="relative lg:hidden">
      <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border">
        <Menu className="size-5" />
        <span className="sr-only">Menu {nama}</span>
      </summary>
      <nav
        className="absolute right-0 z-50 mt-2 w-64 rounded-lg border bg-background p-2 shadow-lg"
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
      </nav>
    </details>
  );
}
