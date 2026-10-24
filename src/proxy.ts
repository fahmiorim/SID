import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (dahulu "middleware") — Next.js 16.
 *
 * Perannya **hanya** optimistis: mengalihkan pengguna tanpa cookie sesi ke
 * halaman masuk lebih awal agar tidak sempat memuat halaman admin. Ini BUKAN
 * lapisan otorisasi — pemeriksaan sesi & izin yang sebenarnya tetap dilakukan
 * di server (Data Access Layer: `src/lib/dal.ts`), karena proxy dapat dilewati
 * (mis. saat memanggil Server Action/Route Handler secara langsung).
 */

/** Halaman publik: boleh diakses tanpa sesi. */
const PUBLIC_PATHS = ["/desa", "/masuk"] as const;

/**
 * Berkas metadata yang harus selalu dapat diambil mesin pencari/perayap tanpa
 * sesi. Tidak boleh dialihkan ke halaman masuk.
 *
 * Semuanya benar-benar ada: `sitemap.ts`/`robots.ts` (`/sitemap.xml`,
 * `/robots.txt`), `icon.svg`, serta metadata route `manifest.ts` dan
 * `opengraph-image.tsx` yang menghasilkan `/manifest.webmanifest` dan
 * `/opengraph-image`.
 */
const PUBLIC_FILES = [
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/icon.svg",
  "/opengraph-image",
] as const;

function isPublicPath(pathname: string): boolean {
  // Beranda publik.
  if (pathname === "/") return true;

  // Halaman informasi layanan mandiri boleh dibaca tanpa sesi; area warga di
  // bawahnya (`/layanan-mandiri/beranda`, dst.) tetap dilindungi.
  if (pathname === "/layanan-mandiri") return true;

  if (PUBLIC_FILES.includes(pathname as (typeof PUBLIC_FILES)[number])) return true;

  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (!isPublicPath(pathname) && !sessionCookie) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Pengalihan pengguna yang sudah masuk ditangani halaman `/masuk` di server
  // karena proxy tidak dapat membedakan akun staf dan akun warga.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Semua rute kecuali: API, aset Next, favicon, dan berkas statis.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
