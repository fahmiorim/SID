import { eq, sql } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { inventaris, villages } from "@/db/schema";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status Desa",
  description: "Status dan informasi lengkap desa",
};

export default async function StatusDesaPage() {
  const { desa } = await siapkanTema();
  const villageId = desa.id;

  // Ambil profil desa dari village table
  const [profil] = await db
    .select({
      id: villages.id,
      namaDesa: villages.name,
      kodeDesa: villages.code,
      kodePos: villages.postalCode,
      kecamatan: villages.district,
      kodeKecamatan: villages.districtCode,
      kabupaten: villages.regency,
      kodeKabupaten: villages.regencyCode,
      provinsi: villages.province,
      kodeProvinsi: villages.provinceCode,
      namaKepala: villages.headName,
      nipKepala: villages.headNip,
      logo: villages.logo,
    })
    .from(villages)
    .where(eq(villages.id, villageId));

  // Hitung total inventaris
  const [inventarisCountRow] =
    (await db
      .select({ value: sql<number>`count(*)` })
      .from(inventaris)
      .where(eq(inventaris.villageId, villageId))) ?? [];

  const totalInventaris = inventarisCountRow?.value ?? 0;

  // Hitung inventaris per kategori
  const kategoriStats =
    (await db
      .select({
        kategori: inventaris.kategoriId,
        count: sql`count(*)`,
      })
      .from(inventaris)
      .where(eq(inventaris.villageId, villageId))
      .groupBy(inventaris.kategoriId)) ?? [];

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Status Desa</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Profil Desa</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nama Desa</p>
            <p className="text-medium">{profil?.namaDesa || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kode Desa</p>
            <p className="text-medium">{profil?.kodeDesa || "—"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Kepala Desa</p>
            <p className="text-medium">{profil?.namaKepala || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">NIP</p>
            <p className="text-medium">{profil?.nipKepala || "—"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Kode Pos</p>
            <p className="text-medium">{profil?.kodePos || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kecamatan</p>
            <p className="text-medium">{profil?.kecamatan || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kabupaten</p>
            <p className="text-medium">{profil?.kabupaten || "—"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Provinsi</p>
            <p className="text-medium">{profil?.provinsi || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Logo</p>
            <p className="text-medium">{profil?.logo ? "Ada" : "—"}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Ringkasan Inventaris</h2>

        <div className="flex items-center justify-between">
          <span>Total catatan: {totalInventaris}</span>
          <span className="text-xs text-muted-foreground">{kategoriStats.length} kategori</span>
        </div>

        {totalInventaris > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {kategoriStats.map((k) => {
              const kategoriId = k.kategori as number | undefined;
              const countVal = (k.count as number) || 0;
              return (
                <div key={kategoriId}>
                  <p className="text-sm text-muted-foreground">
                    {kategoriId !== undefined ? `Kategori ${kategoriId}` : "—"}: {countVal}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">Belum ada data inventaris di desa ini.</p>
        )}
      </div>
    </div>
  );
}
