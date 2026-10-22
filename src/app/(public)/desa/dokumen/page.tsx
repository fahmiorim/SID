import { FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dokumen Publik" };

const RENCANA = [
  "Laporan Realisasi APBDes",
  "Rencana Kerja Pemerintah Desa (RKPDes)",
  "Peraturan Desa",
  "Profil & Statistik Desa",
] as const;

/** Informasi publik & produk hukum. CMS dokumen dibangun pada Fase 1C/1F. */
export default function DokumenPublikPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Informasi Publik</h1>
        <p className="text-muted-foreground">Dokumen resmi desa yang dapat diakses warga.</p>
      </header>

      <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Arsip dokumen belum tersedia. Sementara ini, laporan keuangan dapat dilihat pada halaman{" "}
        <Link href="/desa/apbdes" className="text-primary underline-offset-4 hover:underline">
          Transparansi APBDes
        </Link>
        .
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Dokumen yang akan tersedia</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {RENCANA.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-lg border p-4">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
