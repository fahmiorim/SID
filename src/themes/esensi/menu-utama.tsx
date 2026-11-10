"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicNavItem } from "@/features/publik/domain/menu";

/**
 * Menu utama desktop tema `esensi`.
 *
 * Tautan mengisi tinggi penuh bilah navigasi dan menandai halaman aktif dengan
 * garis bawah — pola yang lebih tenang daripada blok pill, sekaligus membuat
 * seluruh tinggi bar dapat diklik. Submenu muncul saat kursor atau fokus
 * keyboard berada di induknya.
 */
export function MenuUtama({ menu }: { menu: PublicNavItem[] }) {
  const pathname = usePathname();
  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const grupAktif = (item: PublicNavItem) =>
    aktif(item.href) || (item.children ?? []).some((anak) => aktif(anak.href));

  /** Kelas dasar: garis bawah tersembunyi, muncul saat aktif atau hover. */
  const dasar = [
    "relative inline-flex h-14 items-center gap-1 px-3 text-[13.5px] font-medium tracking-[0.01em] transition-colors",
    "after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-current after:transition-opacity after:content-['']",
  ].join(" ");

  return (
    <nav className="hidden items-center lg:flex" aria-label="Menu utama">
      {menu.map((item) =>
        item.children && item.children.length > 0 ? (
          <div key={item.href} className="group relative">
            <Link
              href={item.href}
              aria-current={grupAktif(item) ? "page" : undefined}
              className={`${dasar} ${
                grupAktif(item)
                  ? "after:opacity-100"
                  : "opacity-80 after:opacity-0 hover:opacity-100"
              }`}
            >
              {item.label}
              <ChevronDown
                className="size-3.5 opacity-70 transition-transform group-hover:rotate-180"
                aria-hidden="true"
              />
            </Link>
            <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul
                className="min-w-56 rounded-[calc(var(--pub-radius)*1.1)] border bg-popover p-1.5 text-popover-foreground shadow-xl"
                style={{ boxShadow: "0 18px 40px -24px rgb(0 0 0 / 0.45)" }}
              >
                {item.children.map((anak) => (
                  <li key={anak.href}>
                    <Link
                      href={anak.href}
                      aria-current={aktif(anak.href) ? "page" : undefined}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
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
        ) : (
          <Link
            key={item.href}
            href={item.href}
            aria-current={aktif(item.href) ? "page" : undefined}
            className={`${dasar} ${
              aktif(item.href)
                ? "after:opacity-100"
                : "opacity-80 after:opacity-0 hover:opacity-100"
            }`}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
