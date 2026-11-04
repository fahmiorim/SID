import type { Metadata } from "next";

import { NoAccess } from "@/components/shared/no-access";
import { getBukuPembangunanCetakData } from "@/features/bumindes/application/use-cases";
import { formatTanggalIndonesia } from "@/features/bumindes/domain/buku-resmi";
import {
  BukuResmiView,
  type DesaCetak,
} from "@/features/bumindes/presentation/components/buku-resmi-view";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { todayIsoDate } from "@/lib/forms";

export const metadata: Metadata = { title: "Cetak Buku Pembangunan" };

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

export default async function CetakPembangunanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Cetak Buku" description="Buku Pembangunan." />;
  }
  const sp = await searchParams;
  const tahun = sp.tahun ? Number(sp.tahun) : undefined;
  const data = await getBukuPembangunanCetakData(Number.isFinite(tahun) ? tahun : undefined);
  return (
    <BukuResmiView
      desa={data.desa ?? DESA_KOSONG}
      tabel={data.tabel}
      backHref="/bumindes/pembangunan"
      eksporHref={
        tahun ? `/bumindes/pembangunan/ekspor?tahun=${tahun}` : "/bumindes/pembangunan/ekspor"
      }
      tanggalCetak={formatTanggalIndonesia(todayIsoDate())}
      subjudul={data.subjudul}
    />
  );
}
