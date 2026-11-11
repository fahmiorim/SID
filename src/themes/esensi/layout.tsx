import { ArrowRight, ChevronDown, Mail, MapPin, Menu, Phone } from "lucide-react";
import Link from "next/link";

import { kontrasTeks, SOSMED_LABELS } from "@/features/publik/domain/theme";
import { MenuUtama } from "@/themes/menu-utama";
import { NavBawah } from "@/themes/nav-bawah";
import type { LayoutProps } from "@/themes/types";
import { TEMA_WADAH, ThemeSkipLink } from "@/themes/ui";

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
      className="flex min-h-dvh flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom))] text-foreground lg:pb-0 print:pb-0"
      style={{
        fontFamily: "var(--pub-font)",
        backgroundColor: "var(--pub-halaman)",
        backgroundImage: [
          "radial-gradient(1200px 600px at 8% -10%, color-mix(in srgb, var(--pub-primary) 16%, transparent), transparent 60%)",
          "radial-gradient(900px 500px at 100% 0%, color-mix(in srgb, var(--pub-secondary) 12%, transparent), transparent 62%)",
          "linear-gradient(180deg, color-mix(in srgb, var(--pub-primary) 6%, transparent), transparent 720px)",
        ].join(", "),
      }}
    >
      <ThemeSkipLink />

      <div
        className="hidden border-b border-black/5 text-[11px] tracking-[0.01em] sm:block"
        style={{ backgroundColor: "var(--pub-secondary)", color: warnaBilah }}
      >
        <div
          className={`${TEMA_WADAH} flex min-h-9 flex-wrap items-center justify-between gap-x-5 gap-y-1 py-1.5`}
        >
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
        className={`tema-esensi-header border-b ${berwarna ? "text-[var(--pub-primary-text-foreground)]" : "text-foreground"}`}
      >
        <div className={`${TEMA_WADAH} flex items-center gap-5 py-5 sm:py-6`}>
          <Link href="/" className="flex min-w-0 items-center gap-3.5">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
              <img
                src={logo}
                alt={`Logo ${nama}`}
                className="size-12 shrink-0 object-contain sm:size-14"
              />
            ) : (
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-[calc(var(--pub-radius)*1.2)] text-base font-bold shadow-sm sm:size-14 sm:text-lg ${
                  berwarna
                    ? "bg-white/15 text-white"
                    : "tema-gradien text-[var(--pub-primary-text-foreground)]"
                }`}
              >
                {(nama.charAt(0) || "D").toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span
                className={`block text-[10px] font-semibold tracking-[0.22em] uppercase ${
                  berwarna ? "opacity-80" : "text-[var(--pub-primary-text)]"
                }`}
              >
                Pemerintah Desa
              </span>
              <span className="mt-0.5 block truncate text-xl leading-tight font-bold tracking-[-0.015em] sm:text-[1.7rem]">
                {nama}
              </span>
              {lokasi ? (
                <span
                  className={`mt-1 flex items-center gap-1 text-xs ${berwarna ? "opacity-80" : "text-muted-foreground"}`}
                >
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{lokasi}</span>
                </span>
              ) : null}
            </span>
          </Link>

          <div
            className={`ml-auto hidden shrink-0 border-l pl-5 text-right md:block ${
              berwarna ? "border-white/25" : "border-[var(--pub-garis)]"
            }`}
          >
            {desa.namaKepalaDesa ? (
              <>
                <span
                  className={`block text-[10px] font-semibold tracking-[0.18em] uppercase ${
                    berwarna ? "opacity-75" : "text-muted-foreground"
                  }`}
                >
                  Kepala Desa
                </span>
                <span className="mt-1 block text-sm font-semibold">{desa.namaKepalaDesa}</span>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className="sticky top-0 z-40 border-b border-white/10 shadow-[0_1px_0_rgb(0_0_0_/_0.12),0_20px_40px_-24px_rgb(0_0_0_/_0.6)] backdrop-blur-xl"
        style={{
          backgroundColor: "var(--pub-primary-text)",
          backgroundImage:
            "linear-gradient(100deg, var(--pub-primary-text) 0%, color-mix(in srgb, var(--pub-primary-text) 84%, #000000) 100%)",
          color: "var(--pub-primary-text-foreground)",
        }}
      >
        <div className={`${TEMA_WADAH} flex h-14 items-center gap-2`}>
          {opsi.tampilMenu ? (
            <MenuUtama menu={menu} />
          ) : (
            <Link href="/" className="text-sm font-semibold">
              Beranda
            </Link>
          )}
          <MobileMenu nama={nama} menu={menu} tampilMenu={opsi.tampilMenu} />
          <div className="flex-1" />
          <Link
            href="/layanan-mandiri"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold whitespace-nowrap shadow-sm transition hover:shadow-md sm:px-4 sm:text-[13px]"
            style={{ color: "var(--pub-primary-text)" }}
          >
            Layanan Mandiri
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {opsi.teksBerjalan ? (
        <div
          className="border-b"
          aria-label="Teks berjalan"
          style={{
            backgroundColor: "color-mix(in srgb, var(--pub-primary) 5%, var(--background))",
          }}
        >
          <div className={`${TEMA_WADAH} flex items-center gap-2.5 py-2 text-xs`}>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{
                backgroundColor: "var(--pub-primary)",
                color: "var(--pub-primary-foreground)",
              }}
            >
              Info
            </span>
            <p className="min-w-0 truncate text-muted-foreground">{opsi.teksBerjalan}</p>
          </div>
        </div>
      ) : null}

      <main id="konten-utama" tabIndex={-1} className={`${TEMA_WADAH} flex-1 py-9 sm:py-14`}>
        {children}
      </main>

      <footer className="tema-esensi-footer mt-auto">
        <div
          className={`${TEMA_WADAH} grid gap-10 py-12 sm:py-16 ${
            opsi.tampilKontakFooter
              ? "sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr]"
              : "sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]"
          }`}
        >
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
                <img src={logo} alt={`Logo ${nama}`} className="size-11 object-contain" />
              ) : (
                <span className="tema-gradien flex size-11 items-center justify-center rounded-[calc(var(--pub-radius)*1.1)] text-sm font-bold text-white ring-1 ring-white/20">
                  {(nama.charAt(0) || "D").toUpperCase()}
                </span>
              )}
              <span className="text-base font-bold tracking-tight text-white">{nama}</span>
            </Link>
            <p className="max-w-xs text-[13px] leading-relaxed">
              Portal informasi resmi desa untuk berita, transparansi anggaran, data kependudukan,
              dan layanan warga.
            </p>
            {opsi.sosmed.length > 0 ? (
              <ul className="flex flex-wrap gap-2 pt-1">
                {opsi.sosmed.map((item) => (
                  <li key={item.platform}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] font-medium text-white/80 transition hover:border-white/45 hover:text-white"
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
              { href: "/desa/agenda", label: "Agenda" },
              { href: "/desa/peta", label: "Peta Desa" },
              { href: "/desa/kontak", label: "Kontak" },
            ]}
          />

          <FooterLinks
            title="Transparansi"
            links={[
              { href: "/desa/apbdes", label: "APBDes" },
              { href: "/desa/statistik", label: "Statistik Desa" },
              { href: "/desa/pembangunan", label: "Pembangunan" },
              { href: "/desa/inventaris", label: "Inventaris" },
              { href: "/desa/dokumen", label: "Informasi Publik" },
            ]}
          />

          {opsi.tampilKontakFooter ? (
            <div className="space-y-4">
              <h2 className="text-[11px] font-semibold tracking-[0.18em] text-white/95 uppercase">
                Kontak
              </h2>
              <ul className="space-y-2.5 text-[13px]">
                {desa.alamatKantor ? (
                  <li className="flex gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-white/55" aria-hidden="true" />
                    <span>{desa.alamatKantor}</span>
                  </li>
                ) : null}
                {desa.telepon ? (
                  <li className="flex gap-2.5">
                    <Phone className="mt-0.5 size-4 shrink-0 text-white/55" aria-hidden="true" />
                    <a href={`tel:${desa.telepon}`} className="transition hover:text-white">
                      {desa.telepon}
                    </a>
                  </li>
                ) : null}
                {desa.emailDesa ? (
                  <li className="flex gap-2.5">
                    <Mail className="mt-0.5 size-4 shrink-0 text-white/55" aria-hidden="true" />
                    <a
                      href={`mailto:${desa.emailDesa}`}
                      className="break-all transition hover:text-white"
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
                      className="transition hover:text-white"
                    >
                      {desa.website}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t border-white/12">
          <div
            className={`${TEMA_WADAH} flex flex-col gap-2 py-5 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between`}
          >
            <p>
              © {new Date().getFullYear()} {nama} · {tema.nama}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span>Senin–Kamis 08.00–15.00 · Jumat 08.00–11.00 WIB</span>
              <Link href="/masuk" className="transition hover:text-white">
                Masuk Pengelola
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <NavBawah />
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
    <div className="space-y-4">
      <h2 className="text-[11px] font-semibold tracking-[0.18em] text-white/95 uppercase">
        {title}
      </h2>
      <ul className="space-y-2.5 text-[13px]">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="transition hover:text-white">
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
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-white/30 px-3.5 text-xs font-semibold">
        <Menu className="size-4" aria-hidden="true" />
        Menu
        <span className="sr-only">{nama}</span>
      </summary>
      <nav
        className="absolute top-full left-0 z-50 mt-2 max-h-[75vh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border bg-background p-2 text-foreground shadow-lg"
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
