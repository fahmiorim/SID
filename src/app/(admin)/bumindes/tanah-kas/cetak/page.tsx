import type { Metadata } from "next";

import { NoAccess } from "@/components/shared/no-access";
import { getBukuTanahKasCetakData } from "@/features/bumindes/application/use-cases";
import { formatTanggalIndonesia } from "@/features/bumindes/domain/buku-resmi";
import {
  BukuResmiView,
  type DesaCetak,
} from "@/features/bumindes/presentation/components/buku-resmi-view";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { todayIsoDate } from "@/lib/forms";

export const metadata: Metadata = { title: "Cetak Buku Tanah Kas Desa" };

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

export default async function CetakTanahKasPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Cetak Buku" description="Buku Tanah Kas Desa." />;
  }
  const data = await getBukuTanahKasCetakData();
  return (
    <BukuResmiView
      desa={data.desa ?? DESA_KOSONG}
      tabel={data.tabel}
      backHref="/bumindes/tanah-kas"
      eksporHref="/bumindes/tanah-kas/ekspor"
      tanggalCetak={formatTanggalIndonesia(todayIsoDate())}
    />
  );
}
