import { Download, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { urlMedia } from "@/features/publik/domain/format";
import { listDokumenPublik } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "Informasi Publik" };

/** Informasi publik & produk hukum (dari tabel `dokumen_publik`). */
export default async function DokumenPublikPage() {
  const desa = await getIdentitasFromRequest();
  const dokumen = await listDokumenPublik(desa.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Informasi Publik</h1>
        <p className="text-muted-foreground">Dokumen resmi desa yang dapat diakses warga.</p>
      </header>

      {dokumen.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          Arsip dokumen belum tersedia. Sementara ini, laporan keuangan dapat dilihat pada halaman{" "}
          <Link href="/desa/apbdes" className="text-primary underline-offset-4 hover:underline">
            Transparansi APBDes
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {dokumen.map((item) => {
            const berkas = urlMedia(item.berkas);
            const tautan = berkas ?? item.tautan;
            const eksternal = !berkas && Boolean(item.tautan);

            return (
              <li key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.nama}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.jenis, item.nomor, item.tahun].filter(Boolean).join(" · ") ||
                        item.kategori}
                    </p>
                    {item.keterangan ? (
                      <p className="mt-2 text-sm text-muted-foreground">{item.keterangan}</p>
                    ) : null}
                    {tautan ? (
                      <a
                        href={tautan}
                        target={eksternal ? "_blank" : undefined}
                        rel={eksternal ? "noopener noreferrer" : undefined}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        {eksternal ? (
                          <ExternalLink className="size-3.5" />
                        ) : (
                          <Download className="size-3.5" />
                        )}
                        {eksternal ? "Buka tautan" : "Unduh"}
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
