import { ClipboardList, MessageSquareText, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { listPengaduanPublikData } from "@/features/pengaduan/application/use-cases";
import { labelKategori, type StatusPengaduan } from "@/features/pengaduan/domain/pengaduan";
import { PengaduanFormPublik } from "@/features/pengaduan/presentation/components/pengaduan-form-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();

  return {
    title: `Pengaduan Warga · ${desa.namaDesa ?? "Desa"}`,
    description: `Sampaikan pengaduan dan masukan Anda kepada pemerintah ${desa.namaDesa ?? "desa"}`,
  };
}

const STATUS_LABEL: Record<StatusPengaduan, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

function badgeStatus(status: StatusPengaduan) {
  const gaya: Record<StatusPengaduan, CSSProperties> = {
    baru: { border: "1px solid var(--pub-garis)" },
    diproses: {
      backgroundColor: "var(--pub-primary)",
      color: "var(--pub-primary-foreground)",
    },
    selesai: {
      backgroundColor: "color-mix(in srgb, var(--pub-primary) 10%, transparent)",
      color: "var(--pub-primary-text)",
    },
    ditolak: { backgroundColor: "#fef2f2", color: "#991b1b" },
  };

  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={gaya[status]}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Halaman publik pengaduan — Fase 3D.
 *
 * Warga mengirim pengaduan tanpa masuk (desa ditentukan dari host) dan melihat
 * pengaduan yang telah disetujui petugas untuk ditampilkan; identitas pelapor
 * sudah disamarkan oleh `listPengaduanPublikData`.
 */
export default async function PengaduanPage() {
  const { desa } = await siapkanTema();
  const daftar = await listPengaduanPublikData(desa.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ThemePageHeader
          title="Pengaduan Warga"
          description={`Saluran resmi saran dan pengaduan warga ${desa.namaDesa ?? "desa"}.`}
        />
        <Link
          href="/desa/pengaduan/lacak"
          className="tema-link-primary inline-flex min-h-11 items-center gap-2 rounded-[var(--pub-radius)] border px-4 text-sm font-medium hover:underline"
        >
          <Search className="size-4" aria-hidden="true" />
          Lacak status pengaduan
        </Link>
      </div>

      <PengaduanFormPublik />

      <section className="space-y-4">
        <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
          <MessageSquareText className="size-5" aria-hidden="true" />
          Pengaduan yang dipublikasikan
          <span className="text-sm font-normal text-muted-foreground">
            ({daftar.length.toLocaleString("id-ID")})
          </span>
        </h2>

        {daftar.length === 0 ? (
          <ThemeCard className="p-8 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Belum ada pengaduan yang ditampilkan oleh desa. Pengaduan Anda tetap diproses meskipun
              tidak dipublikasikan.
            </p>
          </ThemeCard>
        ) : (
          <ul className="space-y-4">
            {daftar.map((item) => (
              <ThemeCard as="li" key={item.id} className="p-4 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {badgeStatus(item.status)}
                  <span className="rounded-full border px-2.5 py-1 text-[11px] font-medium">
                    {labelKategori(item.kategori)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{item.nomorTiket}</span>
                </div>
                <h3 className="font-semibold">{item.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {item.isi}
                </p>
                {item.tanggapan ? (
                  <div className="mt-3 rounded-[calc(var(--pub-radius)*0.8)] border border-dashed p-3 text-sm leading-relaxed">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Tanggapan desa
                      {item.ditanggapiPada
                        ? ` · ${new Date(item.ditanggapiPada).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}`
                        : ""}
                    </p>
                    <p className="whitespace-pre-line">{item.tanggapan}</p>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  {item.namaPelapor}
                  {item.createdAt
                    ? ` · ${new Date(item.createdAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}`
                    : ""}
                </p>
              </ThemeCard>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ClipboardList className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Simpan nomor tiket hasil pengiriman Anda untuk melacak status secara mandiri di halaman
          Lacak Pengaduan (butuh nomor tiket + NIK/telepon/email yang Anda isi). Pengaduan berisi
          SARA, provokasi, atau data pihak lain tanpa izin dapat ditolak.
        </span>
      </p>
    </div>
  );
}
