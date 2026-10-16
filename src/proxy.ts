import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (dahulu "middleware") — Next.js 16.
 *
 * Perannya **hanya** optimistis: mengalihkan pengguna tanpa cookie sesi ke
 * halaman masuk lebih awal agar tidak sempat memuat halaman terproteksi.
 * Ini BUKAN lapisan otorisasi — pemeriksaan sesi & izin yang sebenarnya tetap
 * dilakukan di server (Data Access Layer: `src/lib/dal.ts`), karena proxy dapat
 * dilewati (mis. saat memanggil Server Action/Route Handler secara langsung).
 */

const PUBLIC_PATHS = ["/masuk"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const publicPath = isPublicPath(pathname);

  if (!publicPath && !sessionCookie) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (publicPath && sessionCookie) {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Semua rute kecuali: API, aset Next, favicon, dan berkas statis.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
