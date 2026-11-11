"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import type { PublicNavItem } from "@/features/publik/domain/menu";

type Varian = "esensi" | "natra";

/**
 * Menu utama desktop situs publik.
 *
 * Submenu dibuka oleh hover atau fokus keyboard, lalu ditutup saat kursor
 * meninggalkan grup, fokus pindah keluar, tautan diklik, halaman berganti,
 * pengguna menekan Escape, atau klik terjadi di luar navigasi. State eksplisit
 * ini menggantikan `group-focus-within`, yang membuat panel tetap terbuka
 * setelah tautan induk diklik karena fokus masih tertinggal di tautan tersebut.
 */
export function MenuUtama({ menu, varian = "esensi" }: { menu: PublicNavItem[]; varian?: Varian }) {
  const pathname = usePathname();
  const idNav = useId();
  const navRef = useRef<HTMLElement>(null);
  const pemicuRef = useRef<HTMLAnchorElement>(null);
  // Pathname disimpan bersama panel: pindah halaman otomatis menutupnya tanpa
  // setState di dalam effect, dan panel tidak muncul lagi saat kembali.
  const [panel, setPanel] = useState<{ href: string; pathname: string } | null>(null);
  const terbuka = panel?.pathname === pathname ? panel.href : null;
  const buka = (href: string) => setPanel({ href, pathname });
  const tutup = () => setPanel(null);

  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const grupAktif = (item: PublicNavItem) =>
    aktif(item.href) || (item.children ?? []).some((anak) => aktif(anak.href));

  useEffect(() => {
    if (!terbuka) return;

    const tutupDiLuar = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) tutup();
    };
    const tanganiEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      tutup();
      pemicuRef.current?.focus();
    };

    document.addEventListener("pointerdown", tutupDiLuar);
    document.addEventListener("keydown", tanganiEscape);
    return () => {
      document.removeEventListener("pointerdown", tutupDiLuar);
      document.removeEventListener("keydown", tanganiEscape);
    };
  }, [terbuka]);

  const esensi = varian === "esensi";
  const tautanAtas = esensi
    ? "relative inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-medium tracking-[0.01em] transition-all duration-200"
    : "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200";
  const keadaan = (aktifItem: boolean) =>
    aktifItem
      ? "bg-white/14 text-current shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
      : "text-current opacity-75 hover:bg-white/10 hover:opacity-100";

  return (
    <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Menu utama">
      {menu.map((item, indeks) => {
        const punyaAnak = Boolean(item.children && item.children.length > 0);
        const iniTerbuka = terbuka === item.href;
        const idPanel = `${idNav}-${indeks}`;
        const rataKanan = menu.length - indeks <= 2;

        const isiTautan = (
          <>
            {item.label}
            {punyaAnak ? (
              <ChevronDown
                className={`size-3.5 opacity-70 transition-transform ${iniTerbuka ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            ) : null}
          </>
        );

        if (!punyaAnak) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktif(item.href) ? "page" : undefined}
              className={`${tautanAtas} ${keadaan(aktif(item.href))}`}
            >
              {isiTautan}
            </Link>
          );
        }

        return (
          <div
            key={item.href}
            className="relative"
            onMouseEnter={() => buka(item.href)}
            onMouseLeave={tutup}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) tutup();
            }}
          >
            <Link
              href={item.href}
              aria-current={grupAktif(item) ? "page" : undefined}
              aria-expanded={iniTerbuka}
              aria-controls={idPanel}
              onFocus={(event) => {
                pemicuRef.current = event.currentTarget;
                buka(item.href);
              }}
              onClick={tutup}
              className={`${tautanAtas} ${keadaan(grupAktif(item))}`}
            >
              {isiTautan}
            </Link>

            <div
              id={idPanel}
              className={`absolute top-full z-50 pt-2 transition-all duration-200 ${
                rataKanan ? "right-0" : "left-0"
              } ${
                iniTerbuka
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              }`}
            >
              <ul
                className={`w-max max-w-[calc(100vw-2rem)] min-w-60 space-y-0.5 border p-2 shadow-xl ${
                  esensi
                    ? "rounded-[calc(var(--pub-radius)*1.1)] bg-popover text-popover-foreground"
                    : "rounded-lg bg-background text-foreground"
                }`}
                style={esensi ? { boxShadow: "0 18px 40px -24px rgb(0 0 0 / 0.45)" } : undefined}
              >
                {item.children?.map((anak) => (
                  <li key={anak.href}>
                    <Link
                      href={anak.href}
                      aria-current={aktif(anak.href) ? "page" : undefined}
                      onClick={tutup}
                      className={`block rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors hover:bg-accent ${
                        aktif(anak.href)
                          ? "bg-accent font-semibold text-[var(--pub-primary-text)]"
                          : ""
                      }`}
                    >
                      {anak.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
