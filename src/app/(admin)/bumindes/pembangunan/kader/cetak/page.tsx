import type { Metadata } from "next";

import { NoAccess } from "@/components/shared/no-access";
import { getBukuKaderCetakData } from "@/features/bumindes/application/use-cases";
import { formatTanggalIndonesia } from "@/features/bumindes/domain/buku-resmi";
import {
  BukuResmiView,
  type DesaCetak,
} from "@/features/bumindes/presentation/components/buku-resmi-view";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { todayIsoDate } from "@/lib/forms";

export const metadata: Metadata = { title: "Cetak Buku Kader Pembangunan" };

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

export default async function CetakKaderPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Cetak Buku" description="Buku Kader Pembangunan." />;
  }
  const data = await getBukuKaderCetakData();
  return (
    <BukuResmiView
      desa={data.desa ?? DESA_KOSONG}
      tabel={data.tabel}
      backHref="/bumindes/pembangunan/kader"
      eksporHref="/bumindes/pembangunan/kader/ekspor"
      tanggalCetak={formatTanggalIndonesia(todayIsoDate())}
    />
  );
}
