/**
 * Menu navigasi situs publik (Fase 1D).
 *
 * `susunMenu` mengubah baris `menu_publik` menjadi daftar tautan datar; menu
 * bertingkat diratakan karena header situs desa umumnya satu baris. Bila desa
 * belum punya menu di basis data, dipakai `PUBLIC_NAV` bawaan agar navigasi
 * tetap tampil pada instalasi baru.
 */

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

export interface MenuRowInput {
  id: number;
  nama: string;
  link: string;
  parentId: number | null;
}

/**
 * Susun menu navigasi dari baris `menu_publik` (bila ada), dengan fallback ke
 * menu statis bawaan. Menu bertingkat diratakan menjadi satu tingkat dengan
 * label induk sebagai awalan agar tetap terbaca di header ramping.
 */
export function susunMenu(menu: MenuRowInput[]): PublicNavItem[] {
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
