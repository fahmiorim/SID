"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicNavItem } from "@/features/publik/domain/menu";

/**
 * Menu utama desktop tema `esensi`.
 *
 * Hanya sedikit menu yang tampil di baris header; tautan turunannya muncul saat
 * kursor atau fokus keyboard berada di induknya. Menu aktif ditandai dari
 * `usePathname` agar warga tahu sedang berada di halaman mana.
 */
export function MenuUtama({ menu }: { menu: PublicNavItem[] }) {
  const pathname = usePathname();
  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const grupAktif = (item: PublicNavItem) =>
    aktif(item.href) || (item.children ?? []).some((anak) => aktif(anak.href));

  return (
    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Menu utama">
      {menu.map((item) =>
        item.children && item.children.length > 0 ? (
          <div key={item.href} className="group relative">
            <Link
              href={item.href}
              aria-current={grupAktif(item) ? "page" : undefined}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                grupAktif(item)
                  ? "bg-white/15 text-[var(--pub-primary-foreground)]"
                  : "text-[var(--pub-primary-foreground)] opacity-85 hover:bg-white/10 hover:opacity-100"
              }`}
            >
              {item.label}
              <ChevronDown
                className="size-3.5 opacity-60 transition-transform group-hover:rotate-180"
                aria-hidden="true"
              />
            </Link>
            <div className="invisible absolute top-full left-0 z-50 pt-1.5 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="min-w-52 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg">
                {item.children.map((anak) => (
                  <li key={anak.href}>
                    <Link
                      href={anak.href}
                      aria-current={aktif(anak.href) ? "page" : undefined}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                        aktif(anak.href) ? "bg-accent font-medium" : ""
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
            className={`rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
              aktif(item.href)
                ? "bg-white/15 text-[var(--pub-primary-foreground)]"
                : "text-[var(--pub-primary-foreground)] opacity-85 hover:bg-white/10 hover:opacity-100"
            }`}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
