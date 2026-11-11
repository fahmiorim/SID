import {
  ArrowRight,
  BarChart3,
  FileText,
  HandCoins,
  HeartPulse,
  Landmark,
  MapPin,
  MessageSquareText,
  Store,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { agendaLabelTanggal } from "@/features/agenda/domain/agenda";
import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import { namaLengkap } from "@/themes/helper";
import type { HomeProps } from "@/themes/types";
import { KontenHtml } from "@/themes/ui";

/**
 * Beranda tema `natra` — hero berwarna penuh, akses cepat, pemerintahan,
 * transparansi APBDes, lalu bagian yang urutannya diatur `opsi.beranda`.
 */
export function NatraHome(props: HomeProps) {
  const { ctx, slider, statistik, berita, surat } = props;
  const widgetTampil = props.widget.filter((item) => item.judul || item.isi);

  const bagian: Record<string, ReactNode> = {
    hero: <Hero key="hero" {...props} />,
    slider: slider.length > 0 ? <Slider key="slider" items={slider} /> : null,
    statistik: (
      <section key="statistik" className="space-y-4">
        <SectionHeading eyebrow="Statistik" title="Data Kependudukan" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Penduduk", nilai: statistik.total },
            { label: "Laki-laki", nilai: statistik.lakiLaki },
            { label: "Perempuan", nilai: statistik.perempuan },
            { label: "Kartu Keluarga", nilai: statistik.keluarga },
          ].map((item, indeks) => (
            <div
              key={item.label}
              className="tema-kartu tema-natra-stat ui-reveal p-5 text-center text-[var(--pub-secondary-foreground)]"
              style={{ animationDelay: `${indeks * 45}ms` }}
            >
              <p className="text-3xl font-bold tracking-[-0.03em] tabular-nums">
                {item.nilai.toLocaleString("id-ID")}
              </p>
              <p className="mt-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase opacity-80">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    ),
    widget:
      widgetTampil.length > 0 ? (
        <section key="widget" className="space-y-4">
          <SectionHeading eyebrow="Informasi" title="Informasi Desa" />
          <div className="grid gap-4 sm:grid-cols-2">
            {widgetTampil.map((item) => (
              <div key={item.id} className="tema-kartu space-y-2 p-5">
                {item.judul ? <h3 className="font-semibold">{item.judul}</h3> : null}
                {item.isi ? (
                  <KontenHtml
                    html={item.isi}
                    className="prose-desa text-sm leading-relaxed text-muted-foreground"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null,
    berita:
      berita.length > 0 ? (
        <section key="berita" className="space-y-4">
          <SectionHeading
            eyebrow="Kabar desa"
            title="Berita Terbaru"
            href="/desa/berita"
            action="Semua berita"
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {berita.map((item) => {
              const sampul = urlMedia(item.gambar);
              return (
                <li
                  key={item.id}
                  className="tema-kartu tema-kartu-interaktif ui-reveal overflow-hidden"
                >
                  <Link href={`/desa/berita/${item.slug}`} className="group block h-full">
                    {sampul ? (
                      <div className="overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sampul}
                          alt={item.judul}
                          className="aspect-video w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                        />
                      </div>
                    ) : null}
                    <div className="p-4">
                      {item.kategori ? (
                        <span className="tema-chip bg-[var(--brand-soft)] text-[var(--brand)]">
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
    surat: <SuratSection key="surat" surat={surat} />,
    agenda: (
      <section key="agenda" className="space-y-4">
        <SectionHeading eyebrow="Jadwal" title="Agenda Desa" />
        {props.agenda.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada agenda kegiatan.
          </p>
        ) : (
          <ul className="tema-kartu divide-y divide-black/[0.05]">
            {props.agenda.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold">{item.judul}</span>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.lokasi ?? "Lokasi belum diatur"}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {agendaLabelTanggal(item.mulai, item.selesai)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    ),
    kontak: (
      <section key="kontak" className="space-y-4">
        <SectionHeading eyebrow="Hubungi kami" title="Kontak Desa" />
        <div
          className="relative overflow-hidden rounded-[calc(var(--pub-radius)*1.5)] p-6 text-[var(--pub-primary-text-foreground)] shadow-[0_26px_54px_-36px_var(--pub-primary-text)] sm:p-8"
          style={{
            backgroundColor: "var(--pub-primary-text)",
            backgroundImage:
              "radial-gradient(90% 130% at 100% 0%, color-mix(in srgb, var(--pub-secondary) 38%, transparent), transparent 60%), linear-gradient(135deg, var(--pub-primary-text), color-mix(in srgb, var(--pub-primary-text) 82%, #000000))",
          }}
        >
          <div aria-hidden="true" className="ui-grid-lines absolute inset-0 opacity-40" />
          <div className="relative">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-70">
              Kantor desa
            </p>
            <p className="mt-2 text-xl font-bold tracking-[-0.02em]">
              {ctx.desa.namaDesa ?? "Desa"}
            </p>
            <p className="mt-2 text-sm leading-relaxed opacity-85">
              {ctx.desa.alamatKantor ?? "Alamat kantor desa belum diatur."}
            </p>
            <p className="mt-1 text-sm opacity-85">
              {[ctx.desa.telepon, ctx.desa.emailDesa].filter(Boolean).join(" · ") ||
                "Kontak belum diatur."}
            </p>
          </div>
        </div>
      </section>
    ),
  };

  const urutan = [...new Set([...ctx.opsi.beranda, "kontak"])];
  const tampil = new Set(urutan);
  const sisa = urutan
    .filter((id) => id !== "hero" && id !== "slider")
    .map((id) => bagian[id] ?? null)
    .filter((node) => node !== null);

  return (
    <div className="space-y-16">
      {tampil.has("hero") ? bagian.hero : null}
      {tampil.has("slider") && slider.length > 0 ? bagian.slider : null}
      {tampil.has("hero") ? <QuickLinks /> : null}
      <PemerintahanSection ctx={ctx} sambutan={props.sambutan} perangkat={props.perangkat} />
      <ApbdesSection apbdes={props.apbdes} />
      {sisa}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.2em] text-[var(--pub-primary-text)] uppercase">
          <span aria-hidden="true" className="tema-garis-gradien h-px w-8 shrink-0" />
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-balance sm:text-[1.7rem]">
          {title}
        </h2>
      </div>
      {href && action ? (
        <Link
          href={href}
          className="tema-link-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          {action}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

const QUICK_LINKS = [
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

function QuickLinks() {
  return (
    <section aria-labelledby="akses-cepat-natra" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--pub-primary-text)] uppercase">
            Layanan warga
          </p>
          <h2
            id="akses-cepat-natra"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] sm:text-[1.7rem]"
          >
            Akses cepat
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((item, indeks) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="tema-kartu tema-kartu-interaktif ui-reveal ui-hover-lift group flex items-start gap-3 p-4"
              style={{ animationDelay: `${indeks * 45}ms` }}
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-[var(--brand)]/10 transition-transform duration-300 group-hover:-rotate-3"
                style={{
                  backgroundColor:
                    "var(--pub-primary-soft, color-mix(in srgb, var(--pub-primary) 10%, transparent))",
                  color: "var(--pub-primary-text)",
                }}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{item.label}</span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
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
    <section className="space-y-4">
      <SectionHeading
        eyebrow="Pemerintahan"
        title="Sambutan Kepala Desa"
        href="/desa/pemerintahan"
        action="Profil & perangkat"
      />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="tema-kartu flex flex-col p-6">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {ringkasTeks(sambutan, 700) ||
              "Selamat datang di portal resmi desa. Semoga informasi dan layanan di sini memudahkan warga."}
          </p>
          <div className="mt-auto border-t pt-4">
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
            className="tema-link-primary mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
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
    <section className="space-y-4">
      <SectionHeading
        eyebrow="Transparansi"
        title={`APBDes ${apbdes.tahun}`}
        href="/desa/apbdes"
        action="Rincian"
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

        <ul className="mt-5 space-y-3 border-t pt-5">
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
    <section className="space-y-4">
      <SectionHeading eyebrow="Administrasi" title="Layanan Surat" />
      <div className="tema-kartu p-5">
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
          className="tema-link-primary mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          Lihat jenis surat
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function Hero({ ctx, statistik }: HomeProps) {
  const desa = ctx.desa;
  const nama = desa.namaDesa ?? "Desa";
  const lokasi = [desa.namaKecamatan, desa.namaKabupaten, desa.namaPropinsi]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="tema-natra-hero ui-reveal p-6 sm:p-10 lg:p-12">
      <div aria-hidden="true" className="ui-grid-lines absolute inset-0 opacity-40" />
      <div
        aria-hidden="true"
        className="ui-soft-pulse absolute -top-28 -right-20 size-80 rounded-full bg-[var(--brand-accent)]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 -bottom-24 size-64 rounded-full border border-white/10"
      />

      <div className="relative max-w-3xl">
        <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] uppercase opacity-80">
          <span aria-hidden="true" className="h-px w-9 shrink-0 bg-white/50" />
          Portal Resmi Pemerintah Desa
        </p>

        <h1 className="mt-4 text-[2.35rem] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance sm:text-[3.4rem] lg:text-[4rem]">
          {ctx.opsi.heroJudul.trim() || nama}
        </h1>

        {lokasi ? (
          <p className="mt-4 flex items-center gap-1.5 text-[13px] opacity-80">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {lokasi}
          </p>
        ) : null}

        <p className="mt-6 max-w-[56ch] text-[15px] leading-[1.75] opacity-85 sm:text-base">
          Portal resmi {nama}. Warga dapat mengajukan surat, melihat transparansi anggaran, memantau
          data kependudukan, dan membaca kabar desa.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={ctx.opsi.heroTombolUrl || "/layanan-mandiri"}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[var(--pub-primary-text)] shadow-[0_12px_26px_-16px_rgb(0_0_0_/_0.6)] transition hover:shadow-lg"
          >
            {ctx.opsi.heroTombol || "Layanan Mandiri Warga"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <Link
            href="/desa/profil"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-white/5 px-5 text-sm font-semibold backdrop-blur transition hover:border-white/60 hover:bg-white/10"
          >
            Profil Desa
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
          <div>
            <dt className="text-[9px] font-semibold tracking-[0.16em] uppercase opacity-60">
              Penduduk
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">
              {statistik.total.toLocaleString("id-ID")}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold tracking-[0.16em] uppercase opacity-60">
              Keluarga
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">
              {statistik.keluarga.toLocaleString("id-ID")}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold tracking-[0.16em] uppercase opacity-60">
              Dusun
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">
              {statistik.perDusun.length.toLocaleString("id-ID")}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Slider({ items }: { items: HomeProps["slider"] }) {
  return (
    <section className="space-y-4">
      <SectionHeading
        eyebrow="Galeri"
        title="Sorotan Desa"
        href="/desa/galeri"
        action="Lihat galeri"
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item, indeks) => {
          const sumber = urlMedia(item.gambar);
          return (
            <li
              key={item.id}
              className="tema-kartu tema-kartu-interaktif ui-reveal group overflow-hidden"
              style={{ animationDelay: `${indeks * 40}ms` }}
            >
              {sumber ? (
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sumber}
                    alt={item.judul ?? "Sorotan desa"}
                    className="aspect-[1600/620] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  />
                </div>
              ) : null}
              {item.judul ? <p className="p-3 text-sm font-semibold">{item.judul}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
