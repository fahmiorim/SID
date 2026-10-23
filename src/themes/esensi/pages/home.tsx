import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import type { HomeProps } from "@/themes/types";
import { KontenHtml, ThemeCard, ThemeEmpty, ThemeStatGrid } from "@/themes/ui";

/**
 * Beranda tema `esensi`.
 *
 * Susunan bagian mengikuti `opsi.beranda` (diatur admin), bukan urutan kode,
 * sehingga operator dapat menyembunyikan atau mengurutkan ulang sorotan.
 */
export function EsensiHome(props: HomeProps) {
  const { ctx, slider, statistik, berita, surat } = props;
  const nama = ctx.desa.namaDesa ?? "Desa";
  const widgetTampil = props.widget.filter((item) => item.judul || item.isi);

  const bagian: Record<string, ReactNode> = {
    hero: <Hero key="hero" {...props} />,
    slider: slider.length > 0 ? <Slider key="slider" items={slider} /> : null,
    statistik: (
      <section key="statistik" className="space-y-4">
        <SectionTitle
          title="Data Kependudukan"
          description="Ringkasan data desa yang diperbarui berkala."
        />
        <ThemeStatGrid
          items={[
            { label: "Total Penduduk", nilai: statistik.total },
            { label: "Laki-laki", nilai: statistik.lakiLaki },
            { label: "Perempuan", nilai: statistik.perempuan },
            { label: "Kartu Keluarga", nilai: statistik.keluarga },
          ]}
        />
      </section>
    ),
    widget:
      widgetTampil.length > 0 ? (
        <section key="widget" className="space-y-4">
          <SectionTitle
            title="Informasi Desa"
            description="Pengumuman dan informasi tambahan dari pengelola desa."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {widgetTampil.map((item) => (
              <ThemeCard key={item.id} className="space-y-2 p-5">
                {item.judul ? <h3 className="font-medium">{item.judul}</h3> : null}
                {item.isi ? (
                  <KontenHtml
                    html={item.isi}
                    className="prose-desa text-sm leading-relaxed text-muted-foreground"
                  />
                ) : null}
              </ThemeCard>
            ))}
          </div>
        </section>
      ) : null,
    berita:
      berita.length > 0 ? (
        <section key="berita" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle
              title="Berita Terbaru"
              description="Kabar dan kegiatan terbaru dari desa."
            />
            <Link
              href="/desa/berita"
              className="tema-link-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Semua berita
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {berita.map((item) => {
              const sampul = urlMedia(item.gambar);
              return (
                <ThemeCard as="li" key={item.id} className="transition-shadow hover:shadow-md">
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
                        <span className="tema-link-primary text-xs font-medium">
                          {item.kategori}
                        </span>
                      ) : null}
                      <h3 className="mt-1 line-clamp-2 font-medium group-hover:underline">
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
                </ThemeCard>
              );
            })}
          </ul>
        </section>
      ) : null,
    surat: (
      <section key="surat" className="space-y-4">
        <SectionTitle
          title="Surat Layanan Terbaru"
          description={`Pelayanan administrasi ${nama}.`}
        />
        {surat.length === 0 ? (
          <ThemeEmpty>Belum ada surat yang diterbitkan.</ThemeEmpty>
        ) : (
          <ThemeCard className="divide-y">
            <ul>
              {surat.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{item.jenisSurat ?? "Surat"}</p>
                    <p className="text-sm text-muted-foreground">{item.namaPemohon ?? "—"}</p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {item.tanggalLabel ?? ""}
                  </time>
                </li>
              ))}
            </ul>
          </ThemeCard>
        )}
      </section>
    ),
    kontak: <Kontak key="kontak" {...props} />,
  };

  const urutan = [...ctx.opsi.beranda, "kontak"]
    .map((id) => bagian[id] ?? null)
    .filter((node) => node !== null);

  return <div className="space-y-16">{urutan}</div>;
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="tema-esensi-judul text-xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function Hero({ ctx, sambutan }: HomeProps) {
  const desa = ctx.desa;
  const nama = desa.namaDesa ?? "Desa";
  const judul = ctx.opsi.heroJudul.trim() || nama;

  return (
    <section
      className="tema-esensi-hero border p-8 sm:p-12"
      style={{ borderRadius: "calc(var(--pub-radius) * 1.5)" }}
    >
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: "color-mix(in srgb, var(--pub-primary) 14%, transparent)",
          color: "var(--pub-primary)",
        }}
      >
        <MapPin className="size-3.5" />
        Website Resmi Desa
      </span>
      <h1 className="tema-esensi-judul mt-4 text-3xl font-bold sm:text-4xl">{judul}</h1>
      {desa.alamatKantor ? <p className="mt-2 text-muted-foreground">{desa.alamatKantor}</p> : null}
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {ringkasTeks(sambutan, 400) ||
          "Selamat datang di portal informasi desa. Warga dapat membaca berita, melihat transparansi anggaran, memantau data kependudukan, dan mengajukan surat secara online."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={ctx.opsi.heroTombolUrl || "/layanan-mandiri"}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--pub-primary)",
            color: "var(--pub-primary-foreground)",
            borderRadius: "var(--pub-radius)",
          }}
        >
          {ctx.opsi.heroTombol || "Layanan Mandiri Warga"}
          <ArrowRight className="size-4" />
        </a>
        <Link
          href="/desa/profil"
          className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          style={{ borderRadius: "var(--pub-radius)" }}
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
      <SectionTitle title="Sorotan Desa" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => {
          const sumber = urlMedia(item.gambar);
          return (
            <ThemeCard as="li" key={item.id}>
              {sumber ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sumber}
                  alt={item.judul ?? "Sorotan desa"}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              {item.judul ? <p className="p-3 text-sm font-medium">{item.judul}</p> : null}
            </ThemeCard>
          );
        })}
      </ul>
    </section>
  );
}

function Kontak({ ctx }: HomeProps) {
  const desa = ctx.desa;

  return (
    <section className="space-y-4">
      <SectionTitle title="Kontak Desa" />
      <ThemeCard className="p-6">
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <MapPin className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.alamatKantor ?? "Alamat kantor desa belum diatur."}</span>
          </li>
          <li className="flex gap-3">
            <Phone className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.telepon ?? "Nomor telepon belum diatur."}</span>
          </li>
          <li className="flex gap-3">
            <Mail className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>{desa.emailDesa ?? "Email belum diatur."}</span>
          </li>
          <li className="flex gap-3">
            <Clock className="tema-link-primary mt-0.5 size-4 shrink-0" />
            <span>Senin – Jumat, 08.00 – 15.00 WIB</span>
          </li>
        </ul>
      </ThemeCard>
    </section>
  );
}
