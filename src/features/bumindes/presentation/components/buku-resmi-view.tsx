import { ArrowLeft, FileDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  kopDesaAlamat,
  kopDesaLines,
  type BukuResmiTabel,
  type KopDesa,
} from "../../domain/buku-resmi";
import { CetakButton } from "./cetak-button";

/** Identitas desa untuk kop + blok tanda tangan kepala desa. */
export interface DesaCetak extends KopDesa {
  namaKepalaDesa: string | null;
  nipKepalaDesa: string | null;
}

interface BukuResmiViewProps {
  desa: DesaCetak;
  tabel: BukuResmiTabel;
  /** Tautan "Kembali" ke halaman asal buku. */
  backHref: string;
  /** Tautan unduh CSV buku ini. */
  eksporHref: string;
  /** Keterangan tanggal untuk blok tanda tangan (mis. `formatTanggalIndonesia`). */
  tanggalCetak?: string;
  /** Catatan opsional di bawah judul (mis. tahun/filter). */
  subjudul?: string;
}

/**
 * Tampilan keluaran resmi satu buku administrasi: toolbar (disembunyikan saat
 * cetak), kop desa, judul buku, tabel baris, dan blok tanda tangan kepala desa.
 * Dipakai ulang semua buku (umum, penduduk, tanah kas, pembangunan, sekretariat).
 */
export function BukuResmiView({
  desa,
  tabel,
  backHref,
  eksporHref,
  tanggalCetak,
  subjudul,
}: BukuResmiViewProps) {
  const headerLines = kopDesaLines(desa);
  const alamat = kopDesaAlamat(desa);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={eksporHref}>
              <FileDown className="size-4" />
              Ekspor CSV
            </a>
          </Button>
          <CetakButton />
        </div>
      </div>

      <article className="mx-auto max-w-[297mm] rounded-lg border bg-white p-10 text-black shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:text-black print:shadow-none">
        <header className="border-b-4 border-double border-black pb-3 text-center">
          {headerLines.map((line, index) => (
            <p
              key={line}
              className={
                index === headerLines.length - 1
                  ? "text-lg font-bold tracking-wide uppercase"
                  : "text-sm font-semibold uppercase"
              }
            >
              {line}
            </p>
          ))}
          {alamat ? <p className="mt-1 text-xs">{alamat}</p> : null}
        </header>

        <div className="mt-5 text-center">
          <h1 className="text-base font-bold uppercase underline">
            {tabel.namaBuku} ({tabel.kodeBuku})
          </h1>
          {subjudul ? <p className="mt-1 text-sm">{subjudul}</p> : null}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {tabel.kolom.map((kolom) => (
                  <th
                    key={kolom}
                    className="border border-black bg-black/5 px-2 py-1 text-left font-semibold"
                  >
                    {kolom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabel.baris.length === 0 ? (
                <tr>
                  <td
                    colSpan={tabel.kolom.length}
                    className="border border-black px-2 py-6 text-center text-muted-foreground"
                  >
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                tabel.baris.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((sel, selIndex) => (
                      <td key={selIndex} className="border border-black px-2 py-1 align-top">
                        {sel === null || sel === undefined || sel === "" ? "-" : String(sel)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-10 ml-auto w-72 text-sm">
          <p>
            {desa.namaDesa ? `Desa ${desa.namaDesa}` : "Desa ..."}
            {tanggalCetak ? `, ${tanggalCetak}` : ""}
          </p>
          <p className="mt-1">Kepala Desa</p>
          <div className="h-20" />
          <p className="border-b border-black font-semibold">
            {desa.namaKepalaDesa ?? ".............................."}
          </p>
          {desa.nipKepalaDesa ? <p className="mt-1 text-xs">NIP. {desa.nipKepalaDesa}</p> : null}
        </div>
      </article>
    </div>
  );
}
