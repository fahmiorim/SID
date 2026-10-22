import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/db";
import { villages } from "@/db/schema";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Surat Desa",
  description: "Informasi dan verifikasi surat desa",
};

export default async function SuratPage() {
  const { desa } = await siapkanTema();
  const villageId = desa.id;

  // Ambil data desa
  const rows = await db
    .select({
      id: villages.id,
      namaDesa: villages.name,
      code: villages.code,
    })
    .from(villages)
    .where(eq(villages.id, villageId));
  const profil = rows[0] || { id: 0, namaDesa: "", code: null };

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Surat Desa</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Profil Desa</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nama Desa</p>
            <p className="text-medium">{profil.namaDesa || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kode Desa</p>
            <p className="text-medium">{profil.code || "—"}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Jenis Surat</h2>

        <p className="text-sm text-muted-foreground">
          Surat-surat yang dapat diverifikasi melalui token/QR code di halaman publik mencakup
          berbagai jenis administrasi desa.
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
          <Link href="/desa/verifikasi-surat">Verifikasi Surat</Link> dengan memasukkan token atau
          kode QR.
        </p>
      </div>
    </div>
  );
}
