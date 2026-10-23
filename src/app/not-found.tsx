import Link from "next/link";

/**
 * 404 untuk URL yang tidak cocok dengan rute mana pun.
 *
 * Halaman ini berada di luar layout publik karena harus tetap dapat dirender
 * ketika host tidak dikenali. Halaman 404 yang dipicu `notFound()` dari rute
 * publik memakai `(public)/not-found.tsx` agar tetap memakai tema desa.
 */
export default function RootNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold tracking-widest text-muted-foreground">404</p>
        <h1 className="text-3xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
