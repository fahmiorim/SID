import { ChevronDown, Mail, MapPin, Menu, Phone } from "lucide-react";
import Link from "next/link";

import { kontrasTeks, SOSMED_LABELS } from "@/features/publik/domain/theme";
import { MenuUtama } from "@/themes/esensi/menu-utama";
import type { LayoutProps } from "@/themes/types";
import { ThemeSkipLink } from "@/themes/ui";

/**
 * Struktur (header + footer) tema `esensi`.
 *
 * Header meniru hierarki portal desa: bilah kontak, identitas pemerintah desa,
 * lalu navigasi berwarna yang menempel saat halaman digulir. Footer memuat
 * identitas, tautan penting, dan kontak agar informasi tidak bergantung pada
 * halaman beranda saja.
 */
export function EsensiLayout({ ctx, children }: LayoutProps) {
  const { desa, menu, tema } = ctx;
  const nama = desa.namaDesa ?? "Desa";
  const logo = desa.logo;
  const opsi = ctx.opsi;
  const berwarna = opsi.headerVarian === "berwarna";
  const lokasi = [desa.namaKecamatan, desa.namaKabupaten, desa.namaPropinsi]
    .filter(Boolean)
    .join(" · ");
  const warnaBilah = kontrasTeks(opsi.warnaSekunder);

  return (
    <div
      data-theme="esensi"
      className="flex min-h-full flex-col bg-background text-foreground"
      style={{ fontFamily: "var(--pub-font)" }}
    >
      <ThemeSkipLink />

      <div
        className="hidden border-b text-xs sm:block"
        style={{ backgroundColor: "var(--pub-secondary)", color: warnaBilah }}
      >
        <div className="mx-auto flex min-h-9 w-full max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-1.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            {desa.alamatKantor ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
                <span className="truncate">{desa.alamatKantor}</span>
              </span>
            ) : null}
            {desa.telepon ? (
              <a
                href={`tel:${desa.telepon}`}
                className="flex shrink-0 items-center gap-1.5 opacity-80 hover:opacity-100"
              >
                <Phone className="size-3.5" aria-hidden="true" />
                {desa.telepon}
              </a>
            ) : null}
            {desa.emailDesa ? (
              <a
                href={`mailto:${desa.emailDesa}`}
                className="hidden shrink-0 items-center gap-1.5 opacity-80 hover:opacity-100 md:flex"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                {desa.emailDesa}
              </a>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {opsi.sosmed.length > 0 ? (
              <ul className="hidden items-center gap-2 md:flex">
                {opsi.sosmed.map((item) => (
                  <li key={item.platform}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="opacity-80 hover:opacity-100"
                    >
                      {SOSMED_LABELS[item.platform]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link href="/masuk" className="font-medium opacity-80 hover:opacity-100">
              Masuk Pengelola
            </Link>
          </div>
        </div>
      </div>

      <header
        data-varian={opsi.headerVarian}
        className={`tema-esensi-header border-b ${
          berwarna ? "text-[var(--pub-primary-foreground)]" : "bg-background text-foreground"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
              <img
                src={logo}
                alt={`Logo ${nama}`}
                className="size-12 shrink-0 object-contain sm:size-14"
              />
            ) : (
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold sm:size-14 sm:text-lg ${
                  berwarna ? "bg-white/15" : "text-[var(--pub-primary-foreground)]"
                }`}
                style={berwarna ? undefined : { backgroundColor: "var(--pub-primary)" }}
              >
                {(nama.charAt(0) || "D").toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-[0.18em] uppercase opacity-70">
                Pemerintah Desa
              </span>
              <span className="block truncate text-lg leading-tight font-bold sm:text-2xl">
                {nama}
              </span>
              {lokasi ? (
                <span className="mt-1 flex items-center gap-1 text-xs opacity-75">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{lokasi}</span>
                </span>
              ) : null}
            </span>
          </Link>

          <div className="ml-auto hidden shrink-0 text-right md:block">
            {desa.namaKepalaDesa ? (
              <>
                <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase opacity-65">
                  Kepala Desa
                </span>
                <span className="mt-1 block text-sm font-semibold">{desa.namaKepalaDesa}</span>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className="sticky top-0 z-40 border-b border-white/10 shadow-sm"
        style={{ backgroundColor: "var(--pub-primary)", color: "var(--pub-primary-foreground)" }}
      >
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          {opsi.tampilMenu ? (
            <MenuUtama menu={menu} />
          ) : (
            <Link href="/" className="text-sm font-semibold">
              Beranda
            </Link>
          )}
          <div className="flex-1" />
          <Link
            href="/layanan-mandiri"
            className="hidden shrink-0 items-center rounded-full bg-white px-4 py-1.5 text-sm font-semibold whitespace-nowrap sm:inline-flex"
            style={{ color: "var(--pub-primary)" }}
          >
            Layanan Mandiri
          </Link>
          <MobileMenu nama={nama} menu={menu} tampilMenu={opsi.tampilMenu} />
        </div>
      </div>

      {opsi.teksBerjalan ? (
        <div className="border-b bg-muted/50" aria-label="Teks berjalan">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-1.5 text-xs sm:px-6">
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
              style={{
                backgroundColor: "color-mix(in srgb, var(--pub-primary) 12%, transparent)",
                color: "var(--pub-primary)",
              }}
            >
              Info
            </span>
            <p className="min-w-0 truncate">{opsi.teksBerjalan}</p>
          </div>
        </div>
      ) : null}

      <main
        id="konten-utama"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
      >
        {children}
      </main>

      <footer className="tema-esensi-footer mt-auto border-t">
        <div
          className={`mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 ${
            opsi.tampilKontakFooter ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"
          }`}
        >
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
                <img src={logo} alt={`Logo ${nama}`} className="size-10 object-contain" />
              ) : (
                <span
                  className="flex size-10 items-center justify-center rounded-lg text-sm font-bold text-[var(--pub-primary-foreground)]"
                  style={{ backgroundColor: "var(--pub-primary)" }}
                >
                  {(nama.charAt(0) || "D").toUpperCase()}
                </span>
              )}
              <span className="text-sm font-bold">{nama}</span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Portal informasi resmi desa untuk berita, transparansi anggaran, data kependudukan,
              dan layanan warga.
            </p>
            {opsi.sosmed.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {opsi.sosmed.map((item) => (
                  <li key={item.platform}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium transition hover:bg-accent"
                    >
                      {SOSMED_LABELS[item.platform]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <FooterLinks
            title="Jelajahi"
            links={[
              { href: "/desa/profil", label: "Profil Desa" },
              { href: "/desa/berita", label: "Berita" },
              { href: "/desa/galeri", label: "Galeri" },
              { href: "/desa/kontak", label: "Kontak" },
            ]}
          />

          <FooterLinks
            title="Transparansi"
            links={[
              { href: "/desa/apbdes", label: "APBDes" },
              { href: "/desa/statistik", label: "Statistik Desa" },
              { href: "/desa/pembangunan", label: "Pembangunan" },
              { href: "/desa/dokumen", label: "Informasi Publik" },
            ]}
          />

          {opsi.tampilKontakFooter ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Kontak</h2>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {desa.alamatKantor ? (
                  <li className="flex gap-2">
                    <MapPin
                      className="mt-0.5 size-3.5 shrink-0 text-[var(--pub-primary)]"
                      aria-hidden="true"
                    />
                    <span>{desa.alamatKantor}</span>
                  </li>
                ) : null}
                {desa.telepon ? (
                  <li className="flex gap-2">
                    <Phone
                      className="mt-0.5 size-3.5 shrink-0 text-[var(--pub-primary)]"
                      aria-hidden="true"
                    />
                    <a href={`tel:${desa.telepon}`} className="hover:text-foreground">
                      {desa.telepon}
                    </a>
                  </li>
                ) : null}
                {desa.emailDesa ? (
                  <li className="flex gap-2">
                    <Mail
                      className="mt-0.5 size-3.5 shrink-0 text-[var(--pub-primary)]"
                      aria-hidden="true"
                    />
                    <a
                      href={`mailto:${desa.emailDesa}`}
                      className="break-all hover:text-foreground"
                    >
                      {desa.emailDesa}
                    </a>
                  </li>
                ) : null}
                {desa.website ? (
                  <li>
                    <a
                      href={desa.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="hover:text-foreground"
                    >
                      {desa.website}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {new Date().getFullYear()} {nama} · {tema.nama}
            </p>
            <Link href="/masuk" className="hover:text-foreground">
              Masuk Pengelola
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="space-y-2 text-xs text-muted-foreground">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
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
    <details className="relative shrink-0 lg:hidden">
      <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-white/30">
        <Menu className="size-5" />
        <span className="sr-only">Menu {nama}</span>
      </summary>
      <nav
        className="absolute right-0 z-50 mt-2 max-h-[75vh] w-72 overflow-y-auto rounded-lg border bg-background p-2 text-foreground shadow-lg"
        aria-label="Menu utama"
      >
        <Link
          href="/layanan-mandiri"
          className="mb-1 block rounded-md px-3 py-2 text-sm font-semibold"
          style={{ backgroundColor: "var(--pub-primary)", color: "var(--pub-primary-foreground)" }}
        >
          Layanan Mandiri
        </Link>
        {menu.map((item) =>
          item.children && item.children.length > 0 ? (
            <details key={item.href} className="border-b border-border/60 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                {item.label}
                <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
              </summary>
              <div className="mb-1 ml-2 border-l pl-2">
                {item.children.map((anak) => (
                  <Link
                    key={anak.href}
                    href={anak.href}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {anak.label}
                  </Link>
                ))}
              </div>
            </details>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </details>
  );
}
