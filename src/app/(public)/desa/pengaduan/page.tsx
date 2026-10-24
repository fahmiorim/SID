import { ClipboardList, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { listPengaduanPublikData } from "@/features/pengaduan/application/use-cases";
import { labelKategori, type StatusPengaduan } from "@/features/pengaduan/domain/pengaduan";
import { PengaduanFormPublik } from "@/features/pengaduan/presentation/components/pengaduan-form-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();

  return {
    title: `Pengaduan Warga · ${desa.namaDesa ?? "Desa"}`,
    description: `Sampaikan pengaduan dan masukan Anda kepada pemerintah ${desa.namaDesa ?? "desa"}`,
  };
}

function badgeStatus(status: StatusPengaduan) {
  switch (status) {
    case "baru":
      return <Badge variant="outline">Baru</Badge>;
    case "diproses":
      return <Badge>Diproses</Badge>;
    case "selesai":
      return <Badge variant="secondary">Selesai</Badge>;
    default:
      return <Badge variant="destructive">Ditolak</Badge>;
  }
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
    <div className="mx-auto max-w-3xl space-y-10 py-12">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Pengaduan Warga</h1>
        <p className="text-sm text-muted-foreground">
          Saluran resmi saran dan pengaduan warga {desa.namaDesa ?? "desa"}.
        </p>
      </div>

      <PengaduanFormPublik />

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessageSquareText className="size-5" />
          Pengaduan yang dipublikasikan
          <span className="text-sm font-normal text-muted-foreground">
            ({daftar.length.toLocaleString("id-ID")})
          </span>
        </h2>

        {daftar.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <p className="text-muted-foreground">
              Belum ada pengaduan yang ditampilkan oleh desa. Pengaduan Anda tetap diproses meskipun
              tidak dipublikasikan.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {daftar.map((item) => (
              <li key={item.id} className="rounded-md border border-border bg-white p-4 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {badgeStatus(item.status)}
                  <Badge variant="outline">{labelKategori(item.kategori)}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{item.nomorTiket}</span>
                </div>
                <h3 className="font-medium">{item.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {item.isi}
                </p>
                {item.tanggapan ? (
                  <div className="mt-3 rounded-lg border border-dashed p-3 text-sm leading-relaxed">
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-start justify-center gap-2 text-xs text-muted-foreground">
        <ClipboardList className="mt-0.5 size-4 shrink-0" />
        <span>
          Simpan nomor tiket hasil pengiriman Anda untuk melacak status melalui petugas desa.
          Pengaduan berisi SARA, provokasi, atau data pihak lain tanpa izin dapat ditolak.
        </span>
      </p>
    </div>
  );
}
