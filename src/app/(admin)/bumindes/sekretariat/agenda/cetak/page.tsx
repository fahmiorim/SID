import type { Metadata } from "next";

import { NoAccess } from "@/components/shared/no-access";
import { getBukuAgendaCetakData } from "@/features/bumindes/application/use-cases";
import { formatTanggalIndonesia } from "@/features/bumindes/domain/buku-resmi";
import {
  BukuResmiView,
  type DesaCetak,
} from "@/features/bumindes/presentation/components/buku-resmi-view";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";
import { todayIsoDate } from "@/lib/forms";

export const metadata: Metadata = { title: "Cetak Buku Agenda/Ekspedisi" };

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

export default async function CetakAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Cetak Buku" description="Buku Agenda/Ekspedisi." />;
  }
  const sp = await searchParams;
  const data = await getBukuAgendaCetakData(sp.jenis);
  const backHref =
    sp.jenis === "keluar" ? "/bumindes/sekretariat/agenda" : "/bumindes/sekretariat/agenda";
  const eksporHref =
    sp.jenis === "keluar"
      ? "/bumindes/sekretariat/agenda/ekspor?jenis=keluar"
      : "/bumindes/sekretariat/agenda/ekspor";
  return (
    <BukuResmiView
      desa={data.desa ?? DESA_KOSONG}
      tabel={data.tabel}
      backHref={backHref}
      eksporHref={eksporHref}
      tanggalCetak={formatTanggalIndonesia(todayIsoDate())}
    />
  );
}
