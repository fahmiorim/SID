"use client";

import { HandHeart, Home, Landmark, Phone, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TAUTAN = [
  { href: "/", label: "Beranda", Ikon: Home },
  { href: "/desa/profil", label: "Profil", Ikon: Landmark },
  { href: "/desa/apbdes", label: "APBDes", Ikon: Wallet },
  { href: "/layanan-mandiri", label: "Layanan", Ikon: HandHeart },
  { href: "/desa/kontak", label: "Kontak", Ikon: Phone },
] as const;

function aktifUntuk(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "/desa";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigasi bawah khusus layar kecil, dipakai kedua tema publik. */
export function NavBawah() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--pub-garis)] bg-background/95 shadow-[0_-12px_30px_-24px_rgb(0_0_0_/_0.55)] backdrop-blur-xl lg:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid w-full max-w-[84rem] grid-cols-5 px-2">
        {TAUTAN.map(({ href, label, Ikon }) => {
          const aktif = aktifUntuk(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  aktif ? "" : "text-muted-foreground hover:text-foreground"
                }`}
                style={aktif ? { color: "var(--pub-primary-text)" } : undefined}
              >
                <Ikon className="size-5" strokeWidth={aktif ? 2.4 : 2} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
