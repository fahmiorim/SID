import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dokumen Desa",
  description: "Dokumen publik dan administrasi desa",
};

export default function DokumenPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Dokumen Desa</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Dokumen Publik</h2>

        <p className="text-sm text-muted-foreground">
          Daftar dokumen administrasi desa yang dapat diakses publik.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-medium text-sm">Surat Keterangan</p>
            <p className="text-sm text-muted-foreground">Keterangan berbagai kepentingan</p>
          </div>
          <div>
            <p className="text-medium text-sm">Surat Keterangan Kelahiran</p>
            <p className="text-sm text-muted-foreground">Laporan kelahiran warga</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-medium text-sm">Surat Kematian</p>
            <p className="text-sm text-muted-foreground">Laporan wafat warga</p>
          </div>
          <div>
            <p className="text-medium text-sm">Surat Perkawinan</p>
            <p className="text-sm text-muted-foreground">Laporan perkawinan</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Untuk verifikasi surat, silakan kunjungi halaman{" "}
          <Link href="/desa/verifikasi-surat" className="text-primary underline">
            Verifikasi Surat
          </Link>{" "}
          dengan memasukkan token atau kode QR.
        </p>
      </div>
    </div>
  );
}
