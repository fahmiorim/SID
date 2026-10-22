import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Menu utama situs publik. */
export const PUBLIC_NAV = [
  { href: "/", label: "Beranda" },
  { href: "/desa/profil", label: "Profil" },
  { href: "/desa/pemerintahan", label: "Pemerintahan" },
  { href: "/desa/berita", label: "Berita" },
  { href: "/desa/galeri", label: "Galeri" },
  { href: "/desa/statistik", label: "Statistik" },
  { href: "/desa/apbdes", label: "APBDes" },
  { href: "/desa/kontak", label: "Kontak" },
] as const;

export interface PublicNavItem {
  href: string;
  label: string;
}

/**
 * Susun menu navigasi dari baris `menu_publik` (bila ada), dengan fallback ke
 * menu statis bawaan. Menu bertingkat diratakan menjadi satu tingkat dengan
 * label induk sebagai awalan agar tetap terbaca di header ramping.
 */
export function susunMenu(
  menu: { nama: string; link: string; parentId: number | null; id: number }[],
): PublicNavItem[] {
  if (menu.length === 0) return [...PUBLIC_NAV];

  const induk = menu.filter((item) => item.parentId === null);
  const anakDari = (id: number) => menu.filter((item) => item.parentId === id);

  const hasil: PublicNavItem[] = [];
  for (const item of induk) {
    hasil.push({ href: item.link, label: item.nama });
    for (const anak of anakDari(item.id)) {
      hasil.push({ href: anak.link, label: `${item.nama}: ${anak.nama}` });
    }
  }
  return hasil.length > 0 ? hasil : [...PUBLIC_NAV];
}

export function PublicHeader({
  namaDesa,
  logo,
  menu,
}: {
  namaDesa: string;
  logo: string | null;
  menu: PublicNavItem[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
            <img src={logo} alt={`Logo ${namaDesa}`} className="size-9 rounded object-contain" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">
              {(namaDesa.charAt(0) || "D").toUpperCase()}
            </span>
          )}
          <span className="max-w-40 truncate text-sm font-semibold sm:max-w-none sm:text-base">
            {namaDesa}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Menu utama">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/layanan-mandiri"
          className="ml-auto hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 lg:ml-2 lg:inline-flex"
        >
          Layanan Mandiri
        </Link>

        <div className="ml-auto lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Buka menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{namaDesa}</SheetTitle>
                <SheetDescription>Menu situs desa</SheetDescription>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 px-4" aria-label="Menu utama">
                {menu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/layanan-mandiri"
                  className="mt-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
                >
                  Layanan Mandiri
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
