import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NoAccess } from "@/components/shared/no-access";
import { getBukuCetakData } from "@/features/bumindes/application/use-cases";
import { formatTanggalIndonesia } from "@/features/bumindes/domain/buku-resmi";
import {
  BukuResmiView,
  type DesaCetak,
} from "@/features/bumindes/presentation/components/buku-resmi-view";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { todayIsoDate } from "@/lib/forms";

export const metadata: Metadata = { title: "Cetak Buku Administrasi" };

const DESA_KOSONG: DesaCetak = {
  namaDesa: null,
  namaKecamatan: null,
  namaKabupaten: null,
  namaPropinsi: null,
  alamatKantor: null,
  telepon: null,
  emailDesa: null,
  namaKepalaDesa: null,
  nipKepalaDesa: null,
};

export default async function CetakBukuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bukuId = Number(id);
  if (!Number.isInteger(bukuId) || bukuId < 1) notFound();

  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Cetak Buku" description="Buku administrasi desa." />;
  }

  const data = await getBukuCetakData(bukuId);
  if (!data) notFound();

  return (
    <BukuResmiView
      desa={data.desa ?? DESA_KOSONG}
      tabel={data.tabel}
      backHref={`/bumindes/buku-administrasi/${bukuId}`}
      eksporHref={`/bumindes/buku-administrasi/${bukuId}/ekspor`}
      tanggalCetak={formatTanggalIndonesia(todayIsoDate())}
    />
  );
}
