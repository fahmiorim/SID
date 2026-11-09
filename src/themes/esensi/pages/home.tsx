import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import type { HomeProps } from "@/themes/types";
import { KontenHtml } from "@/themes/ui";

/**
 * Beranda tema `esensi` bergaya portal desa.
 *
 * Bagian utama memakai susunan dua kolom: kabar dan layanan di kolom lebar,
 * data/agenda/kontak di kolom samping. Pilihan bagian tetap mengikuti
 * `opsi.beranda` yang diatur admin.
 */
export function EsensiHome(props: HomeProps) {
  const { ctx, slider, berita, surat } = props;
  const urutan = [...new Set([...ctx.opsi.beranda, "kontak"])];
  const tampil = new Set(urutan);

  const bagian: Record<string, ReactNode> = {
    berita: berita.length > 0 ? <BeritaSection key="berita" berita={berita} /> : null,
    widget: props.widget.some((item) => item.judul || item.isi) ? (
      <WidgetSection key="widget" items={props.widget} />
    ) : null,
    surat: <SuratSection key="surat" surat={surat} />,
    statistik: <StatistikSection key="statistik" statistik={props.statistik} />,
    agenda: <AgendaSection key="agenda" agenda={props.agenda} />,
    kontak: <KontakSection key="kontak" ctx={ctx} />,
  };

  const utama = urutan
    .filter((id) => ["berita", "widget", "surat"].includes(id))
    .map((id) => bagian[id] ?? null)
    .filter((node) => node !== null);
  const samping = urutan
    .filter((id) => ["statistik", "agenda", "kontak"].includes(id))
    .map((id) => bagian[id] ?? null)
    .filter((node) => node !== null);

  return (
    <div className="space-y-10 sm:space-y-12">
      {tampil.has("hero") ? <Hero {...props} /> : null}
      {tampil.has("slider") && slider.length > 0 ? <Sorotan items={slider} /> : null}
      {tampil.has("hero") ? <QuickLinks /> : null}

      {utama.length > 0 && samping.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-8">{utama}</div>
          <aside className="space-y-6">{samping}</aside>
        </div>
      ) : utama.length > 0 ? (
        <div className="space-y-8">{utama}</div>
      ) : samping.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">{samping}</div>
      ) : null}
    </div>
  );
}

function Hero({ ctx, sambutan, statistik, berita, slider }: HomeProps) {
  const desa = ctx.desa;
  const nama = desa.namaDesa ?? "Desa";
  const judul = ctx.opsi.heroJudul.trim() || nama;
  const unggulan = berita.find((item) => item.headline) ?? berita[0] ?? null;
  const gambar = urlMedia(unggulan?.gambar) ?? urlMedia(slider[0]?.gambar);
  const lokasi = [desa.namaKecamatan, desa.namaKabupaten, desa.namaPropinsi]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      className="tema-esensi-hero relative overflow-hidden border bg-card shadow-sm"
      style={{ borderRadius: "calc(var(--pub-radius) * 1.5)" }}
    >
      <div className="grid lg:grid-cols-[1.02fr_.98fr]">
        <div className="relative z-10 p-6 sm:p-9 lg:p-10">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
            style={{
              backgroundColor: "color-mix(in srgb, var(--pub-primary) 12%, transparent)",
              color: "var(--pub-primary)",
            }}
          >
            <Landmark className="size-3.5" aria-hidden="true" />
            Portal Resmi Pemerintah Desa
          </span>

          <h1 className="tema-esensi-judul mt-4 text-3xl leading-tight font-bold sm:text-4xl lg:text-[2.75rem]">
            {judul}
          </h1>

          {lokasi ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {lokasi}
            </p>
          ) : null}

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {ringkasTeks(sambutan, 320) ||
              "Selamat datang di portal informasi desa. Warga dapat membaca berita, melihat transparansi anggaran, memantau data kependudukan, dan mengajukan surat secara online."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={ctx.opsi.heroTombolUrl || "/layanan-mandiri"}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[var(--pub-primary-foreground)] shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor: "var(--pub-primary)",
                borderRadius: "var(--pub-radius)",
              }}
            >
              {ctx.opsi.heroTombol || "Layanan Mandiri Warga"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/desa/profil"
              className="inline-flex items-center gap-2 border bg-background/80 px-5 py-2.5 text-sm font-semibold transition hover:bg-accent"
              style={{ borderRadius: "var(--pub-radius)" }}
            >
              Profil Desa
            </Link>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border bg-background/70 p-3 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-[var(--pub-primary)]">
                <Users className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg leading-none font-bold tabular-nums">
                  {statistik.total.toLocaleString("id-ID")}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">Penduduk</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-background/70 p-3 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-[var(--pub-primary)]">
                <Store className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg leading-none font-bold tabular-nums">
                  {statistik.keluarga.toLocaleString("id-ID")}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">Kartu Keluarga</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative min-h-64 overflow-hidden lg:min-h-full">
          {gambar ? (
            // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
            <img
              src={gambar}
              alt={unggulan?.judul ?? `Sorotan ${nama}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 15%, rgba(255,255,255,.22), transparent 42%), linear-gradient(135deg, var(--pub-primary), var(--pub-secondary))",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
          {!gambar ? (
            <Newspaper
              className="absolute top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 text-white/10"
              aria-hidden="true"
            />
          ) : null}

          {unggulan ? (
            <Link
              href={`/desa/berita/${unggulan.slug}`}
              className="group absolute inset-x-0 bottom-0 block p-5 text-white sm:p-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                <Newspaper className="size-3" aria-hidden="true" />
                {unggulan.kategori ?? "Berita Utama"}
              </span>
              <h2 className="mt-2 line-clamp-3 text-lg leading-snug font-bold group-hover:underline sm:text-xl">
                {unggulan.judul}
              </h2>
              <time className="mt-2 flex items-center gap-1.5 text-xs text-white/75">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatTanggal(unggulan.terbitPada ?? unggulan.createdAt)}
              </time>
            </Link>
          ) : (
            <div className="relative flex h-full min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-white">
              {desa.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo unggahan desa
                <img src={desa.logo} alt={`Logo ${nama}`} className="size-16 object-contain" />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
                  {(nama.charAt(0) || "D").toUpperCase()}
                </span>
              )}
              <p className="text-sm font-medium text-white/85">
                {lokasi || "Portal informasi desa"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const tautan = [
    {
      href: "/layanan-mandiri",
      label: "Layanan Surat",
      description: "Ajukan surat online",
      icon: FileText,
    },
    {
      href: "/desa/apbdes",
      label: "APBDes",
      description: "Anggaran & realisasi",
      icon: Wallet,
    },
    {
      href: "/desa/statistik",
      label: "Statistik",
      description: "Data kependudukan",
      icon: BarChart3,
    },
    {
      href: "/desa/lapak",
      label: "Lapak Desa",
      description: "Produk warga",
      icon: Store,
    },
  ];

  return (
    <section aria-label="Akses cepat" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tautan.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderRadius: "var(--pub-radius)" }}
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[var(--pub-primary)]"
              style={{ backgroundColor: "color-mix(in srgb, var(--pub-primary) 12%, transparent)" }}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
            </span>
            <ChevronRight
              className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </section>
  );
}

function BeritaSection({ berita }: { berita: NonNullable<HomeProps["berita"]> }) {
  const utama = berita[0];
  if (!utama) return null;

  const lain = berita.slice(1, 5);
  const gambar = urlMedia(utama.gambar);

  return (
    <section>
      <SectionHeading
        eyebrow="Kabar Desa"
        title="Berita Terbaru"
        description="Kegiatan, pengumuman, dan cerita dari desa."
        href="/desa/berita"
        action="Semua berita"
      />

      <article
        className="group overflow-hidden border bg-card shadow-sm"
        style={{ borderRadius: "calc(var(--pub-radius) * 1.1)" }}
      >
        <Link href={`/desa/berita/${utama.slug}`} className="block">
          {" "}
          <div className="relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-[21/9]">
            {gambar ? (
              // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
              <img
                src={gambar}
                alt={utama.judul}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div
                className="relative flex h-full w-full items-end overflow-hidden p-5 sm:p-6"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--pub-primary) 22%, transparent), transparent 40%), linear-gradient(120deg, color-mix(in srgb, var(--pub-primary) 12%, transparent), color-mix(in srgb, var(--pub-primary) 3%, transparent))",
                }}
              >
                <p className="max-w-sm text-2xl leading-tight font-bold text-[var(--pub-primary)]/80 sm:text-3xl">
                  Cerita dari desa
                </p>
                <Newspaper
                  className="absolute right-4 bottom-4 size-20 text-[var(--pub-primary)] opacity-10 sm:size-24"
                  aria-hidden="true"
                />
              </div>
            )}
            <span className="absolute top-4 left-4 rounded-full bg-background/95 px-3 py-1 text-[11px] font-semibold text-[var(--pub-primary)] shadow-sm backdrop-blur">
              {utama.kategori ?? "Berita Desa"}
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-lg leading-snug font-bold group-hover:underline sm:text-xl">
              {utama.judul}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {ringkasTeks(utama.ringkasan, 180)}
            </p>
            <time className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatTanggal(utama.terbitPada ?? utama.createdAt)}
            </time>
          </div>
        </Link>
      </article>

      {lain.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {lain.map((item) => {
            const sampul = urlMedia(item.gambar);
            return (
              <li
                key={item.id}
                className="overflow-hidden border bg-card transition hover:shadow-md"
                style={{ borderRadius: "var(--pub-radius)" }}
              >
                <Link href={`/desa/berita/${item.slug}`} className="group flex h-full gap-3 p-3">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {sampul ? (
                      // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
                      <img src={sampul} alt={item.judul} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[var(--pub-primary)]">
                        <Newspaper className="size-5 opacity-60" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold text-[var(--pub-primary)]">
                      {item.kategori ?? "Berita"}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-snug font-semibold group-hover:underline">
                      {item.judul}
                    </span>
                    <time className="mt-2 block text-[11px] text-muted-foreground">
                      {formatTanggal(item.terbitPada ?? item.createdAt)}
                    </time>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function WidgetSection({ items }: { items: HomeProps["widget"] }) {
  const tampil = items.filter((item) => item.judul || item.isi);
  if (tampil.length === 0) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="Pengumuman"
        title="Informasi Desa"
        description="Catatan dan informasi tambahan dari pengelola desa."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {tampil.map((item) => (
          <article
            key={item.id}
            className="border bg-card p-5 shadow-sm"
            style={{ borderRadius: "var(--pub-radius)" }}
          >
            {item.judul ? <h3 className="font-semibold">{item.judul}</h3> : null}
            {item.isi ? (
              <KontenHtml
                html={item.isi}
                className="prose-desa mt-2 text-sm leading-relaxed text-muted-foreground"
              />
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SuratSection({ surat }: { surat: HomeProps["surat"] }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Layanan Administrasi"
        title="Surat Layanan Terbaru"
        description="Surat yang baru diterbitkan untuk warga."
        href="/desa/surat"
        action="Jenis surat"
      />
      <div
        className="overflow-hidden border bg-card shadow-sm"
        style={{ borderRadius: "var(--pub-radius)" }}
      >
        {surat.length === 0 ? (
          <div className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-[var(--pub-primary)]">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            Belum ada surat yang diterbitkan.
          </div>
        ) : (
          <ul className="divide-y">
            {surat.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 p-4">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[var(--pub-primary)]">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.jenisSurat ?? "Surat"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.namaPemohon ?? "—"}
                    </p>
                  </div>
                </div>
                <time className="shrink-0 pt-1 text-[11px] text-muted-foreground">
                  {item.tanggalLabel ?? ""}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatistikSection({ statistik }: { statistik: HomeProps["statistik"] }) {
  const persen = (nilai: number) =>
    statistik.total > 0 ? Math.round((nilai / statistik.total) * 100) : 0;

  return (
    <SidebarCard
      title="Data Kependudukan"
      icon={<Users className="size-4" aria-hidden="true" />}
      href="/desa/statistik"
      action="Detail"
    >
      <div className="flex items-end justify-between">
        <p className="text-3xl leading-none font-bold tabular-nums">
          {statistik.total.toLocaleString("id-ID")}
        </p>
        <span className="pb-1 text-xs text-muted-foreground">jiwa</span>
      </div>

      <div className="mt-4 space-y-3">
        <StatBar label="Laki-laki" nilai={statistik.lakiLaki} persen={persen(statistik.lakiLaki)} />
        <StatBar
          label="Perempuan"
          nilai={statistik.perempuan}
          persen={persen(statistik.perempuan)}
          warna="var(--pub-secondary)"
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-sm">
        <div>
          <dt className="text-[11px] text-muted-foreground">Kartu Keluarga</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">
            {statistik.keluarga.toLocaleString("id-ID")}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Wilayah dusun</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">
            {statistik.perDusun.length.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>
    </SidebarCard>
  );
}

function StatBar({
  label,
  nilai,
  persen,
  warna = "var(--pub-primary)",
}: {
  label: string;
  nilai: number;
  persen: number;
  warna?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {nilai.toLocaleString("id-ID")} · {persen}%
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${persen}%`, backgroundColor: warna }}
        />
      </div>
    </div>
  );
}

function AgendaSection({ agenda }: { agenda: HomeProps["agenda"] }) {
  return (
    <SidebarCard title="Agenda Desa" icon={<CalendarDays className="size-4" aria-hidden="true" />}>
      {agenda.length === 0 ? (
        <EmptyLine>Belum ada agenda kegiatan.</EmptyLine>
      ) : (
        <ul className="space-y-3">
          {agenda.slice(0, 5).map((item) => (
            <li key={item.id} className="border-l-2 border-[var(--pub-primary)] pl-3">
              <time className="text-[11px] font-medium text-[var(--pub-primary)]">
                {formatTanggal(item.tanggal)}
              </time>
              <p className="mt-0.5 line-clamp-2 text-sm font-medium">{item.perihal}</p>
              {item.asalTujuan ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.asalTujuan}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SidebarCard>
  );
}

function KontakSection({ ctx }: { ctx: HomeProps["ctx"] }) {
  const desa = ctx.desa;

  return (
    <SidebarCard
      title="Kontak Desa"
      icon={<MapPin className="size-4" aria-hidden="true" />}
      href="/desa/kontak"
      action="Detail"
    >
      <ul className="space-y-3 text-sm">
        <ContactLine icon={<MapPin className="size-4" aria-hidden="true" />}>
          {desa.alamatKantor ?? "Alamat kantor desa belum diatur."}
        </ContactLine>
        <ContactLine icon={<Phone className="size-4" aria-hidden="true" />}>
          {desa.telepon ?? "Nomor telepon belum diatur."}
        </ContactLine>
        <ContactLine icon={<Mail className="size-4" aria-hidden="true" />}>
          {desa.emailDesa ?? "Email belum diatur."}
        </ContactLine>
        <ContactLine icon={<Clock className="size-4" aria-hidden="true" />}>
          Senin – Jumat, 08.00 – 15.00 WIB
        </ContactLine>
      </ul>
      <Link
        href="/desa/kontak"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--pub-primary)] hover:underline"
      >
        Lihat halaman kontak
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </SidebarCard>
  );
}

function Sorotan({ items }: { items: HomeProps["slider"] }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Galeri"
        title="Sorotan Desa"
        description="Potret kegiatan dan wajah desa."
        href="/desa/galeri"
        action="Lihat galeri"
      />
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {items.slice(0, 6).map((item) => {
          const gambar = urlMedia(item.gambar);
          return (
            <article
              key={item.id}
              className="w-64 shrink-0 snap-start overflow-hidden border bg-card shadow-sm sm:w-72"
              style={{ borderRadius: "var(--pub-radius)" }}
            >
              <div className="relative aspect-[4/3] bg-muted">
                {gambar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
                  <img
                    src={gambar}
                    alt={item.judul ?? "Sorotan desa"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, color-mix(in srgb, var(--pub-primary) 16%, transparent), transparent)",
                    }}
                  >
                    <Landmark
                      className="size-8 text-[var(--pub-primary)] opacity-40"
                      aria-hidden="true"
                    />
                  </div>
                )}
                {item.judul ? (
                  <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-sm font-medium text-white">
                    {item.judul}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--pub-primary)] uppercase">
          {eyebrow}
        </p>
        <h2 className="tema-esensi-judul mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {href && action ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--pub-primary)] hover:underline"
        >
          {action}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function SidebarCard({
  title,
  icon,
  href,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  href?: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="overflow-hidden border bg-card shadow-sm"
      style={{ borderRadius: "calc(var(--pub-radius) * 1.05)" }}
    >
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <span className="text-[var(--pub-primary)]">{icon}</span>
          {title}
        </h2>
        {href && action ? (
          <Link
            href={href}
            className="text-[11px] font-semibold text-[var(--pub-primary)] hover:underline"
          >
            {action}
          </Link>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ContactLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-[var(--pub-primary)]">{icon}</span>
      <span className="min-w-0 leading-relaxed">{children}</span>
    </li>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="size-1.5 rounded-full bg-[var(--pub-primary)]" />
      {children}
    </p>
  );
}
