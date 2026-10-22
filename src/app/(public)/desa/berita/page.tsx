import type { Metadata } from "next";
import Link from "next/link";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import {
  listBerita,
  listKategoriBerita,
} from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const desa = await getIdentitasFromRequest();
  return {
    title: `Berita Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Kabar terbaru, pengumuman, dan kegiatan ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function BeritaPage({ searchParams }: PageProps<"/desa/berita">) {
  const params = await searchParams;
  const kategori = typeof params.kategori === "string" ? params.kategori : undefined;

  const desa = await getIdentitasFromRequest();
  const [daftar, kategoriList] = await Promise.all([
    listBerita(desa.id, { limit: 30, kategoriSlug: kategori }),
    listKategoriBerita(desa.id),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Berita Desa</h1>
        <p className="text-muted-foreground">Kabar terbaru, pengumuman, dan kegiatan desa.</p>
      </header>

      {kategoriList.length > 0 ? (
        <nav className="flex flex-wrap gap-2">
          <Link
            href="/desa/berita"
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              kategori ? "hover:bg-accent" : "bg-primary text-primary-foreground"
            }`}
          >
            Semua
          </Link>
          {kategoriList.map((item) => (
            <Link
              key={item.id}
              href={`/desa/berita?kategori=${encodeURIComponent(item.slug)}`}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                kategori === item.slug ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {item.nama}
            </Link>
          ))}
        </nav>
      ) : null}

      {daftar.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada berita yang dipublikasikan.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((item) => {
            const sampul = urlMedia(item.gambar);
            return (
              <li key={item.id}>
                <Link
                  href={`/desa/berita/${item.slug}`}
                  className="group block h-full overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  {sampul ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sampul}
                      alt={item.judul}
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <div className="p-4">
                    {item.kategori ? (
                      <span className="text-xs font-medium text-primary">{item.kategori}</span>
                    ) : null}
                    <h2 className="mt-1 line-clamp-2 font-medium group-hover:text-primary">
                      {item.judul}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {ringkasTeks(item.ringkasan, 140)}
                    </p>
                    <time className="mt-3 block text-xs text-muted-foreground">
                      {formatTanggal(item.terbitPada ?? item.createdAt)}
                    </time>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
