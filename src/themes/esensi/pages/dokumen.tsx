import { Download, ExternalLink, FileText } from "lucide-react";

import { urlMedia } from "@/features/publik/domain/format";
import type { DokumenProps } from "@/themes/types";
import { ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Informasi publik & produk hukum. */
export function EsensiDokumen({ dokumen }: DokumenProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Informasi Publik"
        description="Dokumen resmi desa yang dapat diakses warga."
      />

      {dokumen.length === 0 ? (
        <ThemeEmpty>Arsip dokumen belum tersedia.</ThemeEmpty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {dokumen.map((item) => {
            const berkas = urlMedia(item.berkas);
            const tautan = berkas ?? item.tautan;
            const eksternal = !berkas && Boolean(item.tautan);

            return (
              <li
                key={item.id}
                className="border p-4"
                style={{ borderRadius: "var(--pub-radius)" }}
              >
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
                        className="tema-link-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
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
