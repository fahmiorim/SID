import Link from "next/link";

/**
 * 404 yang dipicu `notFound()` dari halaman publik.
 *
 * Berada di dalam route group `(public)` sehingga header/footer tema desa tetap
 * tampil. Untuk URL yang sama sekali tidak cocok, Next.js memakai
 * `app/not-found.tsx`.
 */
export default function PublicNotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground">
        Halaman yang Anda cari mungkin telah dihapus, berubah nama, atau sedang tidak tersedia.
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "var(--pub-primary)",
            color: "var(--pub-primary-foreground)",
          }}
        >
          Kembali ke beranda
        </Link>
        <Link
          href="/desa/kontak"
          className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium"
        >
          Hubungi desa
        </Link>
      </div>
    </div>
  );
}
