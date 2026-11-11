import {
  ArrowRight,
  BarChart3,
  FileText,
  HandCoins,
  HeartPulse,
  Landmark,
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
      <section key="statistik" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Penduduk", nilai: statistik.total },
          { label: "Laki-laki", nilai: statistik.lakiLaki },
          { label: "Perempuan", nilai: statistik.perempuan },
          { label: "Kartu Keluarga", nilai: statistik.keluarga },
        ].map((item) => (
          <div
            key={item.label}
            className="tema-natra-card p-5 text-center"
            style={{
              backgroundColor: "var(--pub-secondary)",
              color: "var(--pub-secondary-foreground)",
            }}
          >
            <p className="text-3xl font-bold tabular-nums">{item.nilai.toLocaleString("id-ID")}</p>
            <p className="mt-1 text-xs tracking-wide uppercase opacity-90">{item.label}</p>
          </div>
        ))}
      </section>
    ),
    widget:
      widgetTampil.length > 0 ? (
        <section key="widget" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Informasi Desa</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {widgetTampil.map((item) => (
              <div
                key={item.id}
                className="tema-natra-card space-y-2 rounded-2xl border bg-card p-5"
              >
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
    surat: <SuratSection key="surat" surat={surat} />,
    agenda: (
      <section key="agenda" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Agenda Desa</h2>
        {props.agenda.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada agenda kegiatan.
          </p>
        ) : (
          <ul className="tema-natra-card divide-y rounded-2xl border bg-card">
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
        <h2 className="text-2xl font-bold tracking-tight">Kontak Desa</h2>
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--pub-primary)",
            color: "var(--pub-primary-foreground)",
          }}
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
    <section aria-label="Akses cepat" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {QUICK_LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="tema-natra-card group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-[color-mix(in_srgb,var(--pub-primary)_32%,transparent)]"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "color-mix(in srgb, var(--pub-primary) 10%, transparent)",
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sambutan Kepala Desa</h2>
        <Link
          href="/desa/pemerintahan"
          className="tema-link-primary text-sm font-semibold hover:underline"
        >
          Profil & perangkat
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="tema-natra-card flex flex-col rounded-2xl border bg-card p-6">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {ringkasTeks(sambutan, 700) ||
              "Selamat datang di portal resmi desa. Semoga informasi dan layanan di sini memudahkan warga."}
          </p>
          <div className="mt-auto border-t pt-4">
            <p className="text-sm font-semibold">{ctx.desa.namaKepalaDesa ?? "Kepala Desa"}</p>
            <p className="text-xs text-muted-foreground">Kepala Desa {ctx.desa.namaDesa ?? ""}</p>
          </div>
        </div>

        <div className="tema-natra-card rounded-2xl border bg-card p-5">
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">APBDes {apbdes.tahun}</h2>
        <Link
          href="/desa/apbdes"
          className="tema-link-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          Rincian
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="tema-natra-card rounded-2xl border bg-card p-5 sm:p-6">
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
      <h2 className="text-2xl font-bold tracking-tight">Layanan Surat</h2>
      <div className="tema-natra-card rounded-2xl border bg-card p-5">
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

function Hero({ ctx }: HomeProps) {
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
        Portal resmi {nama}. Warga dapat mengajukan surat, melihat transparansi anggaran, memantau
        data kependudukan, dan membaca kabar desa.
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
                  className="aspect-[1600/620] w-full object-cover"
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
