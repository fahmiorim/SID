import { ArrowLeft, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PengaduanLacakForm } from "@/features/pengaduan/presentation/components/pengaduan-lacak-form";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();

  return {
    title: `Lacak Pengaduan · ${desa.namaDesa ?? "Desa"}`,
    description: "Lacak status penanganan pengaduan dengan nomor tiket dan identitas pelapor.",
  };
}

/**
 * Halaman publik pelacakan tiket pengaduan — Fase 3D.
 *
 * Form memakai Server Action (bukan query string) agar NIK/telepon tidak
 * tercatat di URL, log akses, atau header Referer.
 */
export default async function LacakPengaduanPage() {
  const { desa } = await siapkanTema();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      <div className="text-center">
        <h1 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold">
          <Search className="size-6" />
          Lacak Pengaduan
        </h1>
        <p className="text-sm text-muted-foreground">
          Masukkan nomor tiket dan salah satu identitas yang Anda isi saat mengirim pengaduan ke{" "}
          {desa.namaDesa ?? "desa"}.
        </p>
      </div>

      <PengaduanLacakForm />

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/desa/pengaduan">
            <ArrowLeft className="size-4" />
            Kembali ke Pengaduan
          </Link>
        </Button>
      </div>
    </div>
  );
}
