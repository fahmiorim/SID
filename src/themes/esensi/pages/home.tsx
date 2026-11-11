import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  HandCoins,
  HeartPulse,
  Landmark,
  Mail,
  MapPin,
  MessageSquareText,
  Newspaper,
  Phone,
  Store,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import { namaLengkap } from "@/themes/helper";
import type { HomeProps } from "@/themes/types";
import { KontenHtml } from "@/themes/ui";

/** Singkatan bulan untuk lencana tanggal agenda (tanpa bergantung locale). */
const BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Beranda tema `esensi`.
 *
 * Komposisi: panel hero (sambutan + sorotan bergambar) yang menjadi satu bidang
 * fokus, deretan akses cepat, lalu dua kolom — kabar dan layanan di kolom
 * lebar, data/agenda/kontak di kolom samping yang menempel saat digulir.
 * Urutan bagian tetap mengikuti `opsi.beranda` yang diatur admin.
 */
export function EsensiHome(props: HomeProps) {
  const { ctx, slider, berita, surat, sambutan, perangkat, apbdes } = props;
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
    <div className="space-y-10 sm:space-y-14">
      {tampil.has("hero") ? <Hero {...props} /> : null}
      {tampil.has("slider") && slider.length > 0 ? <Sorotan items={slider} /> : null}
      {tampil.has("hero") ? <QuickLinks /> : null}
      <PemerintahanSection ctx={ctx} sambutan={sambutan} perangkat={perangkat} />
      <ApbdesSection apbdes={apbdes} />

      {utama.length > 0 && samping.length > 0 ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-10">{utama}</div>
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-20 lg:self-start">{samping}</aside>
        </div>
      ) : utama.length > 0 ? (
        <div className="space-y-10">{utama}</div>
      ) : samping.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">{samping}</div>
      ) : null}
    </div>
  );
}

function Hero({ ctx, statistik, berita, slider }: HomeProps) {
  const desa = ctx.desa;
  const nama = desa.namaDesa ?? "Desa";
  const judul = ctx.opsi.heroJudul.trim() || nama;
  const unggulan = berita.find((item) => item.headline) ?? berita[0] ?? null;
  const gambar = urlMedia(unggulan?.gambar) ?? urlMedia(slider[0]?.gambar);
  const lokasi = [desa.namaKecamatan, desa.namaKabupaten, desa.namaPropinsi]
    .filter(Boolean)
    .join(" · ");

  return (
    <section aria-labelledby="judul-beranda" className="tema-hero p-5 sm:p-8 lg:p-10 xl:p-12">
      <div
        aria-hidden="true"
        className="tema-hero-glow -top-32 -right-20 size-[30rem]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--pub-primary) 45%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="tema-hero-glow -bottom-32 -left-24 size-[26rem]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--pub-secondary) 20%, transparent), transparent 70%)",
        }}
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-stretch lg:gap-12">
        <div className="flex min-w-0 flex-col justify-center">
          <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] text-[var(--pub-primary-text)] uppercase">
            <span aria-hidden="true" className="tema-garis-gradien h-px w-9 shrink-0" />
            Portal Resmi Pemerintah Desa
          </p>

          <h1
            id="judul-beranda"
            className="tema-esensi-judul tema-judul-gradien mt-4 text-[2.6rem] leading-[0.95] font-extrabold tracking-[-0.035em] text-balance sm:text-[3.4rem] lg:text-[4.1rem]"
          >
            {judul}
          </h1>

          {lokasi ? (
            <p className="mt-4 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {lokasi}
            </p>
          ) : null}

          <p className="mt-6 max-w-[56ch] text-[15px] leading-[1.75] text-muted-foreground sm:text-base">
            Portal resmi {nama}. Warga dapat mengajukan surat, melihat transparansi anggaran,
            memantau data kependudukan, dan membaca kabar desa.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={ctx.opsi.heroTombolUrl || "/layanan-mandiri"}
              className="inline-flex min-h-12 items-center gap-2 bg-[var(--pub-primary)] px-6 text-sm font-semibold text-[var(--pub-primary-foreground)] transition hover:brightness-[1.06]"
              style={{
                borderRadius: "var(--pub-radius)",
                boxShadow:
                  "0 12px 26px -14px color-mix(in srgb, var(--pub-primary) 80%, transparent)",
              }}
            >
              {ctx.opsi.heroTombol || "Layanan Mandiri Warga"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/desa/profil"
              className="group inline-flex min-h-12 items-center gap-2 border border-[var(--pub-garis)] bg-white/70 px-5 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-[color-mix(in_srgb,var(--pub-primary)_35%,transparent)] hover:bg-white hover:text-[var(--pub-primary-text)]"
              style={{ borderRadius: "var(--pub-radius)" }}
            >
              Profil Desa
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--pub-garis)] pt-6">
            <HeroStat label="Penduduk" nilai={statistik.total} />
            <HeroStat label="Keluarga" nilai={statistik.keluarga} />
            <HeroStat label="Dusun" nilai={statistik.perDusun.length} />
          </dl>
        </div>

        <figure className="group/hero relative min-w-0 lg:h-full">
          <div
            className="relative aspect-[4/3] overflow-hidden bg-muted ring-1 ring-white/40 sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[28rem]"
            style={{
              borderRadius: "calc(var(--pub-radius) * 1.75)",
              boxShadow:
                "0 40px 80px -32px color-mix(in srgb, var(--pub-primary) 60%, transparent), 0 4px 12px -4px rgb(0 0 0 / 0.12)",
            }}
          >
            {gambar ? (
              // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
              <img
                src={gambar}
                alt={unggulan?.judul ?? `Sorotan ${nama}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/hero:scale-[1.025]"
              />
            ) : (
              <div
                className={`flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center ${
                  unggulan ? "pb-32" : ""
                }`}
                style={{
                  backgroundImage: [
                    "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--pub-primary) 16%, transparent) 1px, transparent 0)",
                    "radial-gradient(120% 100% at 20% 0%, color-mix(in srgb, var(--pub-primary) 16%, transparent), transparent 60%)",
                  ].join(", "),
                  backgroundSize: "18px 18px, auto",
                }}
              >
                {desa.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- logo unggahan desa
                  <img src={desa.logo} alt={`Logo ${nama}`} className="size-16 object-contain" />
                ) : (
                  <span
                    className="flex size-14 items-center justify-center text-xl font-bold text-[var(--pub-primary-foreground)]"
                    style={{
                      backgroundColor: "var(--pub-primary)",
                      borderRadius: "var(--pub-radius)",
                    }}
                  >
                    {(nama.charAt(0) || "D").toUpperCase()}
                  </span>
                )}
                <p className="max-w-[22ch] text-sm leading-relaxed text-muted-foreground">
                  {lokasi || "Portal informasi desa"}
                </p>
              </div>
            )}

            <span className="ui-fade absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[var(--pub-primary-text)] uppercase shadow-sm ring-1 ring-black/5 backdrop-blur sm:top-5 sm:left-5">
              <span className="relative flex size-2" aria-hidden="true">
                <span
                  className="absolute inline-flex size-full rounded-full opacity-60"
                  style={{ backgroundColor: "var(--pub-primary)" }}
                />
                <span
                  className="relative inline-flex size-2 rounded-full"
                  style={{ backgroundColor: "var(--pub-primary)" }}
                />
              </span>
              Portal aktif
            </span>

            {unggulan && gambar ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-5 sm:p-6">
                <Link
                  href={`/desa/berita/${unggulan.slug}`}
                  className="group/caption block text-white"
                >
                  <span className="tema-chip bg-white/20 text-white backdrop-blur-sm">
                    {unggulan.kategori ?? "Berita Utama"}
                  </span>
                  <span className="mt-2.5 line-clamp-3 block text-[17px] leading-snug font-semibold tracking-[-0.01em] group-hover/caption:underline sm:text-lg">
                    {unggulan.judul}
                  </span>
                  <time className="mt-2 flex items-center gap-1.5 text-xs text-white/80">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatTanggal(unggulan.terbitPada ?? unggulan.createdAt)}
                  </time>
                </Link>
              </div>
            ) : null}

            {unggulan && !gambar ? (
              <div
                className="absolute inset-x-0 bottom-0 p-5 sm:p-6"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, var(--card) 55%, color-mix(in srgb, var(--card) 70%, transparent), transparent)",
                }}
              >
                <Link href={`/desa/berita/${unggulan.slug}`} className="group/caption block">
                  <span className="text-[10px] font-semibold tracking-[0.16em] text-[var(--pub-primary-text)] uppercase">
                    {unggulan.kategori ?? "Berita Utama"}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-[15px] leading-snug font-semibold group-hover/caption:underline">
                    {unggulan.judul}
                  </span>
                  <time className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatTanggal(unggulan.terbitPada ?? unggulan.createdAt)}
                  </time>
                </Link>
              </div>
            ) : null}
          </div>
        </figure>
      </div>
    </section>
  );
}

function HeroStat({ label, nilai }: { label: string; nilai: number }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-[1.55rem] leading-none font-bold tracking-tight tabular-nums sm:text-[1.75rem]">
        {nilai.toLocaleString("id-ID")}
      </dd>
    </div>
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
    {
      href: "/desa/bantuan",
      label: "Bansos",
      description: "Program bantuan",
      icon: HandCoins,
    },
    {
      href: "/desa/kesehatan/kia",
      label: "KIA & Posyandu",
      description: "Kesehatan ibu & anak",
      icon: HeartPulse,
    },
    {
      href: "/desa/idm-sdgs",
      label: "IDM & SDGs",
      description: "Capaian pembangunan",
      icon: Landmark,
    },
    {
      href: "/desa/pengaduan",
      label: "Pengaduan",
      description: "Sampaikan keluhan",
      icon: MessageSquareText,
    },
  ];

  return (
    <section aria-labelledby="akses-cepat" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--pub-primary-text)] uppercase">
            Layanan warga
          </p>
          <h2 id="akses-cepat" className="mt-1 text-xl font-bold tracking-[-0.02em]">
            Akses cepat
          </h2>
        </div>
        <Link
          href="/layanan-mandiri"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
        >
          Semua layanan
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tautan.map((item, indeks) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="tema-kartu tema-kartu-interaktif ui-reveal ui-hover-lift group flex items-start gap-3 p-4"
              style={{ animationDelay: `${indeks * 45}ms` }}
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center ring-1 ring-[color-mix(in_srgb,var(--pub-primary)_18%,transparent)] transition-transform duration-300 ring-inset group-hover:scale-105 group-hover:-rotate-3"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, color-mix(in srgb, var(--pub-primary) 16%, transparent), color-mix(in srgb, var(--pub-secondary) 8%, transparent))",
                  color: "var(--pub-primary-text)",
                  borderRadius: "calc(var(--pub-radius) * 0.9)",
                }}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{item.label}</span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-[var(--pub-primary-text)]"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
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

      <article className="tema-kartu group overflow-hidden">
        <Link
          href={`/desa/berita/${utama.slug}`}
          className="block sm:grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-auto sm:min-h-[17rem]">
            {gambar ? (
              // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
              <img
                src={gambar}
                alt={utama.judul}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div
                className="relative flex h-full w-full items-end overflow-hidden p-5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--pub-primary) 34%, transparent), transparent 46%), radial-gradient(circle at 6% 100%, color-mix(in srgb, var(--pub-secondary) 26%, transparent), transparent 50%), linear-gradient(125deg, color-mix(in srgb, var(--pub-primary) 18%, transparent), color-mix(in srgb, var(--pub-primary) 5%, transparent))",
                }}
              >
                <p className="max-w-[14ch] text-xl leading-tight font-bold text-[var(--pub-primary-text)]/85">
                  Cerita dari desa
                </p>
                <Newspaper
                  className="absolute right-4 bottom-4 size-16 text-[var(--pub-primary-text)] opacity-15"
                  aria-hidden="true"
                />
              </div>
            )}
            <span className="tema-chip absolute top-4 left-4 bg-background/95 text-[var(--pub-primary-text)] shadow-sm backdrop-blur">
              {utama.kategori ?? "Berita Desa"}
            </span>
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-7">
            <h3 className="text-xl leading-[1.25] font-bold tracking-[-0.015em] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 sm:text-[1.375rem]">
              {utama.judul}
            </h3>
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {ringkasTeks(utama.ringkasan, 180)}
            </p>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--pub-garis)] pt-3.5">
              <time className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatTanggal(utama.terbitPada ?? utama.createdAt)}
              </time>
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--pub-primary-text)]">
                Baca
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </Link>
      </article>

      {lain.length > 0 ? (
        <ul className="tema-kartu mt-3 divide-y overflow-hidden">
          {lain.map((item) => {
            const sampul = urlMedia(item.gambar);
            return (
              <li key={item.id}>
                <Link
                  href={`/desa/berita/${item.slug}`}
                  className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5"
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {sampul ? (
                      // eslint-disable-next-line @next/next/no-img-element -- media unggahan desa
                      <img src={sampul} alt={item.judul} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[var(--pub-primary-text)]">
                        <Newspaper className="size-5 opacity-60" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold tracking-[0.14em] text-[var(--pub-primary-text)] uppercase">
                      {item.kategori ?? "Berita"}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug font-semibold group-hover:underline">
                      {item.judul}
                    </span>
                  </span>
                  <time className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                    {formatTanggal(item.terbitPada ?? item.createdAt)}
                  </time>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
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
          <article key={item.id} className="tema-kartu p-5 sm:p-6">
            {item.judul ? (
              <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{item.judul}</h3>
            ) : null}
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

function PemerintahanSection({
  ctx,
  sambutan,
  perangkat,
}: {
  ctx: HomeProps["ctx"];
  sambutan: HomeProps["sambutan"];
  perangkat: HomeProps["perangkat"];
}) {
  const tampil = perangkat.slice(0, 4);
  if (!sambutan && tampil.length === 0) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="Pemerintahan"
        title="Sambutan Kepala Desa"
        description="Arahan dan perangkat yang melayani warga desa."
        href="/desa/pemerintahan"
        action="Profil & perangkat"
      />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="tema-kartu flex flex-col p-6 sm:p-7">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {ringkasTeks(sambutan, 700) ||
              "Selamat datang di portal resmi desa. Semoga informasi dan layanan di sini memudahkan warga."}
          </p>
          <div className="mt-auto border-t border-[var(--pub-garis)] pt-4">
            <p className="text-sm font-semibold">{ctx.desa.namaKepalaDesa ?? "Kepala Desa"}</p>
            <p className="text-xs text-muted-foreground">Kepala Desa {ctx.desa.namaDesa ?? ""}</p>
          </div>
        </div>

        <div className="tema-kartu p-5">
          <h3 className="text-[10px] font-semibold tracking-[0.18em] uppercase">Perangkat Desa</h3>
          {tampil.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Data perangkat belum tersedia.</p>
          ) : (
            <ul className="mt-3.5 space-y-3">
              {tampil.map((item) => {
                const foto = urlMedia(item.foto);
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element -- foto perangkat unggahan desa
                      <img
                        src={foto}
                        alt={namaLengkap(item.nama, item.gelarDepan, item.gelarBelakang)}
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--pub-primary) 10%, transparent)",
                          color: "var(--pub-primary-text)",
                        }}
                        aria-hidden="true"
                      >
                        {(item.nama.charAt(0) || "P").toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">
                        {namaLengkap(item.nama, item.gelarDepan, item.gelarBelakang)}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {item.jabatan ?? "Perangkat Desa"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/desa/pemerintahan"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
          >
            Lihat semua perangkat
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ApbdesSection({ apbdes }: { apbdes: HomeProps["apbdes"] }) {
  // `baris` selalu berisi seluruh template rekening, jadi tahun tanpa data
  // tetap tampil sebagai Rp 0 bila hanya memeriksa panjang baris.
  if (!apbdes || apbdes.tersedia.length === 0) return null;

  const anggaran = Number(apbdes.total.anggaran);
  const realisasi = Number(apbdes.total.realisasi);
  const serapan = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;

  return (
    <section>
      <SectionHeading
        eyebrow="Transparansi"
        title="APBDes"
        description={`Anggaran dan realisasi Desa ${apbdes.tahun}.`}
        href="/desa/apbdes"
        action="Lihat rincian"
      />
      <div className="tema-kartu p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Anggaran
            </dt>
            <dd className="mt-1.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl">
              {formatRupiah(apbdes.total.anggaran)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Realisasi
            </dt>
            <dd className="mt-1.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl">
              {formatRupiah(apbdes.total.realisasi)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Serapan
            </dt>
            <dd className="mt-1.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl">
              {serapan.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
            </dd>
          </div>
        </dl>

        <ul className="mt-5 space-y-3 border-t border-[var(--pub-garis)] pt-5">
          {apbdes.bidang.slice(0, 4).map((row) => (
            <li key={row.kode}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate font-medium">{row.uraian}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, row.persen))}%`,
                    backgroundColor: "var(--pub-primary)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SuratSection({ surat }: { surat: HomeProps["surat"] }) {
  const jenis = [
    ...new Set(
      surat
        .map((item) => item.jenisSurat)
        .filter((item): item is string => Boolean(item && item.trim())),
    ),
  ].slice(0, 4);

  return (
    <section>
      <SectionHeading
        eyebrow="Layanan Administrasi"
        title="Layanan Surat"
        description="Ajukan surat keterangan tanpa antre di kantor desa."
        href="/layanan-mandiri"
        action="Ajukan surat"
      />
      <div className="tema-kartu p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: "color-mix(in srgb, var(--pub-primary) 8%, transparent)",
              color: "var(--pub-primary-text)",
            }}
          >
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {surat.length > 0
                ? `${surat.length} surat terbit terbaru`
                : "Belum ada surat yang diterbitkan"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {jenis.length > 0
                ? `Jenis terbaru: ${jenis.join(", ")}.`
                : "Warga dapat mengajukan surat kapan saja melalui layanan mandiri."}
            </p>
          </div>
        </div>
        <Link
          href="/desa/surat"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
        >
          Lihat jenis surat
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function StatistikSection({ statistik }: { statistik: HomeProps["statistik"] }) {
  const persen = (nilai: number) =>
    statistik.total > 0 ? Math.round((nilai / statistik.total) * 100) : 0;
  const laki = persen(statistik.lakiLaki);
  const perempuan = persen(statistik.perempuan);

  return (
    <SidebarCard title="Data Kependudukan" href="/desa/statistik" action="Detail">
      <div className="flex items-baseline gap-2">
        <p className="text-[2.05rem] leading-none font-bold tracking-tight tabular-nums">
          {statistik.total.toLocaleString("id-ID")}
        </p>
        <span className="text-xs text-muted-foreground">jiwa</span>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <span
          style={{
            width: `${laki}%`,
            backgroundImage:
              "linear-gradient(135deg, var(--pub-primary), color-mix(in srgb, var(--pub-primary) 60%, var(--pub-secondary)))",
          }}
        />
        <span
          style={{
            width: `${perempuan}%`,
            backgroundImage:
              "linear-gradient(135deg, color-mix(in srgb, var(--pub-secondary) 65%, var(--pub-primary)), var(--pub-secondary))",
          }}
        />
      </div>

      <ul className="mt-3.5 space-y-2 text-xs">
        <li className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--pub-primary)" }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">Laki-laki</span>
          <span className="ml-auto font-semibold tabular-nums">
            {statistik.lakiLaki.toLocaleString("id-ID")} · {laki}%
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--pub-secondary)" }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">Perempuan</span>
          <span className="ml-auto font-semibold tabular-nums">
            {statistik.perempuan.toLocaleString("id-ID")} · {perempuan}%
          </span>
        </li>
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--pub-garis)] pt-4">
        <div>
          <dt className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            Kartu Keluarga
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {statistik.keluarga.toLocaleString("id-ID")}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            Wilayah dusun
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {statistik.perDusun.length.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>
    </SidebarCard>
  );
}

function AgendaSection({ agenda }: { agenda: HomeProps["agenda"] }) {
  return (
    <SidebarCard title="Agenda Desa" href="/desa/agenda" action="Semua">
      {agenda.length === 0 ? (
        <EmptyLine>Belum ada agenda kegiatan.</EmptyLine>
      ) : (
        <ul className="space-y-3.5">
          {agenda.slice(0, 5).map((item) => {
            const bagian = item.mulai.split("-").map(Number);
            const hari = bagian[2] ?? 0;
            const bulan = bagian[1] ?? 0;
            return (
              <li key={item.id} className="flex gap-3">
                <span
                  className="tema-gradien flex size-11 shrink-0 flex-col items-center justify-center text-[var(--pub-primary-text-foreground)] shadow-sm"
                  style={{ borderRadius: "calc(var(--pub-radius) * 0.8)" }}
                >
                  <span className="text-[15px] leading-none font-bold tabular-nums">
                    {hari || "•"}
                  </span>
                  <span className="mt-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase opacity-90">
                    {BULAN_SINGKAT[bulan - 1] ?? ""}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[13px] leading-snug font-semibold">
                    {item.judul}
                  </p>
                  {item.lokasi ? (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.lokasi}</span>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SidebarCard>
  );
}

function KontakSection({ ctx }: { ctx: HomeProps["ctx"] }) {
  const desa = ctx.desa;

  return (
    <SidebarCard title="Kontak Desa" href="/desa/kontak" action="Detail">
      <ul className="space-y-3 text-[13px]">
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
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
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
              className="tema-kartu w-64 shrink-0 snap-start overflow-hidden sm:w-72"
            >
              <div className="aspect-[1600/620] bg-muted">
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
                      className="size-8 text-[var(--pub-primary-text)] opacity-40"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              {item.judul ? (
                <p className="p-3 text-sm leading-snug font-semibold">{item.judul}</p>
              ) : null}
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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[var(--pub-garis)] pb-4">
      <div>
        <p className="flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.2em] text-[var(--pub-primary-text)] uppercase">
          <span aria-hidden="true" className="tema-garis-gradien h-px w-7 shrink-0" />
          {eyebrow}
        </p>
        <h2 className="tema-esensi-judul mt-1.5 text-[1.3rem] font-bold tracking-[-0.02em] sm:text-[1.5rem]">
          {title}
        </h2>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {href && action ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
        >
          {action}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}

function SidebarCard({
  title,
  href,
  action,
  children,
}: {
  title: string;
  href?: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <section className="tema-kartu overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--pub-garis)] px-5 py-3.5">
        <h2 className="text-[10px] font-semibold tracking-[0.18em] uppercase">{title}</h2>
        {href && action ? (
          <Link
            href={href}
            className="text-[11px] font-semibold text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
          >
            {action}
          </Link>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function ContactLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 shrink-0 text-[var(--pub-primary-text)]">{icon}</span>
      <span className="min-w-0 leading-relaxed">{children}</span>
    </li>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="size-1.5 rounded-full bg-[var(--pub-primary)]" aria-hidden="true" />
      {children}
    </p>
  );
}
