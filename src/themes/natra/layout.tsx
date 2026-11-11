import { ArrowRight, ChevronDown, Mail, MapPin, Menu, Phone } from "lucide-react";
import Link from "next/link";

import { kontrasTeks, SOSMED_LABELS } from "@/features/publik/domain/theme";
import { MenuUtama } from "@/themes/menu-utama";
import { NavBawah } from "@/themes/nav-bawah";
import type { LayoutProps } from "@/themes/types";
import { TEMA_WADAH, ThemeSkipLink } from "@/themes/ui";

/**
 * Struktur (header + footer) tema `natra`.
 *
 * Natra tetap memakai header berwarna penuh sebagai cirinya, tetapi susunannya
 * kini mengikuti pola Esensi: bilah kontak tipis, identitas desa yang lebih
 * tegas, navigasi yang menempel, dan footer bertingkat. Kelas permukaan serta
 * gerak berasal dari stylesheet bersama agar halaman slot yang dipakai ulang
 * dari Esensi tetap tampil utuh.
 */
export function NatraLayout({ ctx, children }: LayoutProps) {
  const { desa, menu, tema, opsi } = ctx;
  const nama = desa.namaDesa ?? "Desa";
  const lokasi = [desa.namaKecamatan, desa.namaKabupaten, desa.namaPropinsi]
    .filter(Boolean)
    .join(" · ");
  const warnaBilah = kontrasTeks(opsi.warnaSekunder);

  return (
    <div
      data-theme="natra"
      className="flex min-h-dvh flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom))] text-foreground lg:pb-0 print:pb-0"
      style={{
        fontFamily: "var(--pub-font)",
        backgroundColor: "var(--pub-halaman)",
        backgroundImage: [
          "radial-gradient(1100px 560px at 8% -10%, color-mix(in srgb, var(--pub-primary) 14%, transparent), transparent 62%)",
          "radial-gradient(900px 500px at 100% 0%, color-mix(in srgb, var(--pub-secondary) 11%, transparent), transparent 62%)",
          "linear-gradient(180deg, color-mix(in srgb, var(--pub-primary) 5%, transparent), transparent 720px)",
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

      <header className="tema-natra-header sticky top-0 z-40">
        <div className={`${TEMA_WADAH} flex min-h-16 items-center gap-4 py-3`}>
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {desa.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
              <img
                src={desa.logo}
                alt={`Logo ${nama}`}
                className="size-11 shrink-0 object-contain"
              />
            ) : (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-bold ring-1 ring-white/15">
                {(nama.charAt(0) || "D").toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[9px] font-semibold tracking-[0.2em] uppercase opacity-70 sm:text-[10px]">
                Pemerintah Desa
              </span>
              <span className="mt-0.5 block truncate text-base leading-tight font-bold tracking-[-0.02em] sm:text-lg">
                {nama}
              </span>
              {lokasi ? (
                <span className="mt-0.5 hidden items-center gap-1 text-[10px] opacity-70 sm:flex">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{lokasi}</span>
                </span>
              ) : null}
            </span>
          </Link>

          <div className="flex-1" />

          {opsi.tampilMenu ? <MenuUtama menu={menu} varian="natra" /> : null}

          <Link
            href="/layanan-mandiri"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold whitespace-nowrap shadow-sm transition hover:shadow-md lg:inline-flex"
            style={{ color: "var(--pub-primary-text)" }}
          >
            Layanan Mandiri
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>

          {opsi.tampilMenu ? (
            <details className="relative lg:hidden">
              <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/10">
                <Menu className="size-5" aria-hidden="true" />
                <span className="sr-only">Menu {nama}</span>
              </summary>
              <nav
                className="absolute right-0 z-50 mt-2 w-64 rounded-xl border bg-background p-2 text-foreground shadow-xl"
                aria-label="Menu utama"
              >
                {menu.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <details key={item.href} className="border-b border-border/60 last:border-b-0">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                        {item.label}
                        <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
                      </summary>
                      <div className="mb-1 ml-2 border-l pl-2">
                        {item.children.map((anak) => (
                          <Link
                            key={anak.href}
                            href={anak.href}
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
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
                      className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <Link
                  href="/layanan-mandiri"
                  className="mt-1 block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent"
                >
                  Layanan Mandiri
                </Link>
              </nav>
            </details>
          ) : null}
        </div>
      </header>

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

      <footer className="tema-natra-footer mt-auto">
        <div className={`${TEMA_WADAH} grid gap-8 py-12 sm:py-14 md:grid-cols-3`}>
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {desa.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
                <img src={desa.logo} alt={`Logo ${nama}`} className="size-10 object-contain" />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white ring-1 ring-white/20">
                  {(nama.charAt(0) || "D").toUpperCase()}
                </span>
              )}
              <span className="text-base font-bold tracking-tight text-white">{nama}</span>
            </Link>
            <p className="max-w-xs text-[13px] leading-relaxed">
              Portal informasi resmi desa: berita, transparansi, data, dan layanan surat.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Tautan</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/desa/profil">Profil Desa</Link>
              </li>
              <li>
                <Link href="/desa/berita">Berita</Link>
              </li>
              <li>
                <Link href="/desa/apbdes">Transparansi APBDes</Link>
              </li>
              <li>
                <Link href="/layanan-mandiri">Layanan Mandiri</Link>
              </li>
            </ul>
          </div>

          {opsi.tampilKontakFooter ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Kontak</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{desa.alamatKantor ?? "Alamat belum diatur"}</span>
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{desa.telepon ?? "Telepon belum diatur"}</span>
                </li>
                <li className="flex gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{desa.emailDesa ?? "Email belum diatur"}</span>
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t border-white/10">
          <div
            className={`${TEMA_WADAH} flex flex-col gap-1 py-4 text-xs sm:flex-row sm:items-center sm:justify-between`}
          >
            <p>
              © {new Date().getFullYear()} {nama} · {tema.nama}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="hidden sm:inline">
                Senin–Kamis 08.00–15.00 · Jumat 08.00–11.00 WIB
              </span>
              {opsi.sosmed.map((item) => (
                <a
                  key={item.platform}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-white"
                >
                  {SOSMED_LABELS[item.platform]}
                </a>
              ))}
              <Link href="/masuk" className="hover:text-white">
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
