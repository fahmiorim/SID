import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import type { HomeProps } from "@/themes/types";

/**
 * Beranda tema `natra` — hero berwarna penuh, statistik sebagai pita sorotan,
 * berita dalam kartu berbayang. Susunan tetap mengikuti `opsi.beranda`.
 */
export function NatraHome(props: HomeProps) {
  const { ctx, slider, statistik, berita, surat } = props;

  const bagian: Record<string, ReactNode> = {
    hero: <Hero key="hero" {...props} />,
    slider: slider.length > 0 ? <Slider key="slider" items={slider} /> : null,
    statistik: (
      <section key="statistik" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Penduduk", nilai: statistik.total },
          { label: "Laki-laki", nilai: statistik.lakiLaki },
          { label: "Perempuan", nilai: statistik.perempuan },
          { label: "Kartu Keluarga", nilai: statistik.keluarga },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl p-5 text-center text-white"
            style={{ backgroundColor: "var(--pub-secondary)" }}
          >
            <p className="text-3xl font-bold tabular-nums">{item.nilai.toLocaleString("id-ID")}</p>
            <p className="mt-1 text-xs tracking-wide uppercase opacity-90">{item.label}</p>
          </div>
        ))}
      </section>
    ),
    berita:
      berita.length > 0 ? (
        <section key="berita" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Berita Terbaru</h2>
            <Link
              href="/desa/berita"
              className="tema-link-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              Semua
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {berita.map((item) => {
              const sampul = urlMedia(item.gambar);
              return (
                <li
                  key={item.id}
                  className="tema-natra-card overflow-hidden rounded-2xl border bg-card"
                >
                  <Link href={`/desa/berita/${item.slug}`} className="group block h-full">
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
                        <span className="tema-natra-chip rounded-full px-2 py-0.5 text-xs font-semibold">
                          {item.kategori}
                        </span>
                      ) : null}
                      <h3 className="mt-2 line-clamp-2 font-semibold group-hover:underline">
                        {item.judul}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {ringkasTeks(item.ringkasan, 120)}
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
        </section>
      ) : null,
    surat: (
      <section key="surat" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Surat Layanan Terbaru</h2>
        {surat.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada surat yang diterbitkan.
          </p>
        ) : (
          <ul className="tema-natra-card divide-y rounded-2xl border bg-card">
            {surat.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{item.jenisSurat ?? "Surat"}</p>
                  <p className="text-sm text-muted-foreground">{item.namaPemohon ?? "—"}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {item.tanggalLabel ?? ""}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    ),
    kontak: (
      <section key="kontak" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Kontak Desa</h2>
        <div
          className="rounded-2xl p-6 text-white"
          style={{ backgroundColor: "var(--pub-primary)" }}
        >
          <p className="text-sm font-semibold">{ctx.desa.namaDesa ?? "Desa"}</p>
          <p className="mt-1 text-sm opacity-90">
            {ctx.desa.alamatKantor ?? "Alamat kantor desa belum diatur."}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {[ctx.desa.telepon, ctx.desa.emailDesa].filter(Boolean).join(" · ") ||
              "Kontak belum diatur."}
          </p>
        </div>
      </section>
    ),
  };

  const urutan = [...ctx.opsi.beranda, "kontak"]
    .map((id) => bagian[id] ?? null)
    .filter((node) => node !== null);

  return <div className="space-y-16">{urutan}</div>;
}

function Hero({ ctx, sambutan }: HomeProps) {
  const desa = ctx.desa;
  const nama = desa.namaDesa ?? "Desa";

  return (
    <section className="tema-natra-hero overflow-hidden rounded-3xl p-8 sm:p-12">
      <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
        Website Resmi Desa
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
        {ctx.opsi.heroJudul.trim() || nama}
      </h1>
      {desa.alamatKantor ? <p className="mt-3 opacity-90">{desa.alamatKantor}</p> : null}
      <p className="mt-6 max-w-2xl leading-relaxed opacity-90">
        {ringkasTeks(sambutan, 400) ||
          "Selamat datang di portal informasi desa. Warga dapat membaca berita, melihat transparansi anggaran, memantau data kependudukan, dan mengajukan surat secara online."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={ctx.opsi.heroTombolUrl || "/layanan-mandiri"}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          {ctx.opsi.heroTombol || "Layanan Mandiri Warga"}
          <ArrowRight className="size-4" />
        </a>
        <Link
          href="/desa/profil"
          className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/10"
        >
          Profil Desa
        </Link>
      </div>
    </section>
  );
}

function Slider({ items }: { items: HomeProps["slider"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Sorotan Desa</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => {
          const sumber = urlMedia(item.gambar);
          return (
            <li
              key={item.id}
              className="tema-natra-card overflow-hidden rounded-2xl border bg-card"
            >
              {sumber ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sumber}
                  alt={item.judul ?? "Sorotan desa"}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              {item.judul ? <p className="p-3 text-sm font-semibold">{item.judul}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
