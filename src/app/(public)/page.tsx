import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  getStatistikDesa,
  listSuratTerbitTerbaru,
  type StatistikDesa,
  type SuratPublikRow,
} from "@/features/desa/application/statistik-desa";
import type { IdentitasDesa } from "@/features/desa/infrastructure/desa-repository";
import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import {
  getProfilDesa,
  listBerita,
  listSliderBeranda,
  type BeritaRingkas,
  type FotoRingkas,
} from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const desa = await getIdentitasFromRequest();
  const nama = desa.namaDesa ?? "Desa";

  return {
    title: `Beranda · ${nama}`,
    description: `Website resmi ${nama}. Informasi publik, berita, transparansi anggaran, dan layanan surat warga.`,
  };
}

export default async function BerandaPage() {
  const desa = await getIdentitasFromRequest();
  const [statistik, suratTerbaru, slider, beritaTerbaru, profil] = await Promise.all([
    getStatistikDesa(desa.id),
    listSuratTerbitTerbaru(desa.id, 5),
    listSliderBeranda(desa.id),
    listBerita(desa.id, { limit: 3 }),
    getProfilDesa(desa.id),
  ]);

  return (
    <div className="space-y-16">
      <Hero desa={desa} sambutan={profil?.sambutan ?? null} />
      {slider.length > 0 ? <Slider items={slider} /> : null}
      <StatistikRingkas statistik={statistik} />
      {beritaTerbaru.length > 0 ? <BeritaTerbaru items={beritaTerbaru} /> : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SuratTerbaru items={suratTerbaru} />
        </div>
        <div className="lg:col-span-1">
          <Kontak desa={desa} />
        </div>
      </div>
    </div>
  );
}

function Hero({ desa, sambutan }: { desa: IdentitasDesa; sambutan: string | null }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <MapPin className="size-3.5" />
        Website Resmi Desa
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {desa.namaDesa ?? "Desa"}
      </h1>
      {desa.alamatKantor ? <p className="mt-2 text-muted-foreground">{desa.alamatKantor}</p> : null}
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {ringkasTeks(sambutan, 400) ||
          "Selamat datang di portal informasi desa. Warga dapat membaca berita, melihat transparansi anggaran, memantau data kependudukan, dan mengajukan surat secara online."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/layanan-mandiri"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Layanan Mandiri Warga
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/desa/profil"
          className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Profil Desa
        </Link>
      </div>
    </section>
  );
}

function Slider({ items }: { items: FotoRingkas[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Sorotan Desa</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => {
          const sumber = urlMedia(item.gambar);
          return (
            <figure key={item.id} className="overflow-hidden rounded-xl border bg-card">
              {sumber ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sumber}
                  alt={item.judul ?? "Sorotan desa"}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              {item.judul ? (
                <figcaption className="p-3 text-sm font-medium">{item.judul}</figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function BeritaTerbaru({ items }: { items: BeritaRingkas[] }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Berita Terbaru</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kabar dan kegiatan terbaru dari desa.
          </p>
        </div>
        <Link
          href="/desa/berita"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Semua berita
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const sampul = urlMedia(item.gambar);
          return (
            <Link
              key={item.id}
              href={`/desa/berita/${item.slug}`}
              className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              {sampul ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sampul} alt={item.judul} className="aspect-video w-full object-cover" />
              ) : null}
              <div className="p-4">
                {item.kategori ? (
                  <span className="text-xs font-medium text-primary">{item.kategori}</span>
                ) : null}
                <h3 className="mt-1 line-clamp-2 font-medium group-hover:text-primary">
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
          );
        })}
      </div>
    </section>
  );
}

function StatistikRingkas({ statistik }: { statistik: StatistikDesa }) {
  const kartu = [
    { label: "Total Penduduk", nilai: statistik.total },
    { label: "Laki-laki", nilai: statistik.lakiLaki },
    { label: "Perempuan", nilai: statistik.perempuan },
    { label: "Kartu Keluarga", nilai: statistik.keluarga },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Data Kependudukan</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ringkasan data desa yang diperbarui berkala.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {item.nilai.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SuratTerbaru({ items }: { items: SuratPublikRow[] }) {
  return (
    <section className="rounded-xl border p-6">
      <h2 className="text-lg font-semibold tracking-tight">Surat Layanan Terbaru</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Belum ada surat yang diterbitkan.</p>
      ) : (
        <ul className="mt-4 divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
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
      )}
    </section>
  );
}

function Kontak({ desa }: { desa: IdentitasDesa }) {
  return (
    <section className="rounded-xl border p-6">
      <h2 className="text-lg font-semibold tracking-tight">Kontak Desa</h2>
      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{desa.alamatKantor ?? "Alamat kantor desa belum diatur."}</span>
        </li>
        <li className="flex gap-3">
          <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{desa.telepon ?? "Nomor telepon belum diatur."}</span>
        </li>
        <li className="flex gap-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{desa.emailDesa ?? "Email belum diatur."}</span>
        </li>
        <li className="flex gap-3">
          <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>Senin – Jumat, 08.00 – 15.00 WIB</span>
        </li>
      </ul>
    </section>
  );
}
