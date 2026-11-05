import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import { getBantuanDetail } from "@/features/bantuan/application/use-cases";
import {
  asalDanaLabel,
  BANTUAN_RESOURCE,
  sasaranLabel,
  STATUS_MASA_AKTIF_LABELS,
  statusMasaAktif,
} from "@/features/bantuan/domain/bantuan";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cetak Laporan Program Bantuan",
};

/** Format tanggal ISO menjadi `dd-mm-yyyy`; kosong menjadi "-". */
function formatTanggal(nilai: string | null): string {
  if (!nilai) return "-";
  const bagian = nilai.slice(0, 10).split("-");
  return bagian.length === 3 ? `${bagian[2]}-${bagian[1]}-${bagian[0]}` : nilai;
}

/**
 * Laporan resmi program bantuan (OS-POP-011).
 *
 * Format cetak ber-kop desa: identitas program, rekap peserta, dan kolom tanda
 * tangan. Data diambil lewat use case (izin `bantuan` + tenant dari sesi).
 */
export default async function CetakLaporanBantuanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, BANTUAN_RESOURCE, "read")) {
    return <div className="p-6">Tidak memiliki izin.</div>;
  }

  const { id } = await params;
  const programId = Number(id);
  if (!Number.isFinite(programId) || programId <= 0) {
    return <div className="p-6">ID program tidak valid.</div>;
  }

  const [detail, desa] = await Promise.all([
    getBantuanDetail(programId),
    getIdentitasFromRequest(),
  ]);
  const { program, peserta } = detail;
  const masaAktif = statusMasaAktif(program.startDate, program.endDate);
  const hariIni = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6 print:p-0">
      <div className="flex justify-end gap-2 print:hidden">
        <Button asChild variant="outline">
          <Link href={`/bantuan/${program.id}`}>Kembali</Link>
        </Button>
        <PrintButton />
      </div>

      <header className="space-y-1 border-b pb-3 text-center">
        <h1 className="text-lg font-bold uppercase">Laporan Program Bantuan Sosial</h1>
        <p className="text-sm font-medium">{desa.namaDesa ?? "-"}</p>
        <p className="text-xs text-muted-foreground">Dicetak pada {hariIni}</p>
      </header>

      <section>
        <h2 className="mb-2 font-semibold">Identitas Program</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr className="border">
              <td className="w-1/3 border px-3 py-1 font-medium">Nama Program</td>
              <td className="border px-3 py-1">{program.name}</td>
            </tr>
            <tr className="border">
              <td className="border px-3 py-1 font-medium">Sasaran</td>
              <td className="border px-3 py-1">{sasaranLabel(program.sasaran)}</td>
            </tr>
            <tr className="border">
              <td className="border px-3 py-1 font-medium">Asal Dana</td>
              <td className="border px-3 py-1">{asalDanaLabel(program.asalDana)}</td>
            </tr>
            <tr className="border">
              <td className="border px-3 py-1 font-medium">Masa Aktif</td>
              <td className="border px-3 py-1">
                {formatTanggal(program.startDate)} s.d. {formatTanggal(program.endDate)} (
                {STATUS_MASA_AKTIF_LABELS[masaAktif]})
              </td>
            </tr>
            <tr className="border">
              <td className="border px-3 py-1 font-medium">Keterangan</td>
              <td className="border px-3 py-1">{program.description ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Daftar Peserta ({peserta.length} orang)</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border bg-muted/50">
              <th className="w-10 border px-2 py-1 text-left">No</th>
              <th className="border px-2 py-1 text-left">Nama Sasaran</th>
              <th className="border px-2 py-1 text-left">Identitas</th>
              <th className="border px-2 py-1 text-left">No. Kartu</th>
              <th className="border px-2 py-1 text-left">Nama pada Kartu</th>
            </tr>
          </thead>
          <tbody>
            {peserta.length === 0 ? (
              <tr className="border">
                <td colSpan={5} className="border px-2 py-3 text-center text-muted-foreground">
                  Belum ada peserta terdaftar.
                </td>
              </tr>
            ) : (
              peserta.map((row, indeks) => (
                <tr key={row.id} className="border">
                  <td className="border px-2 py-1 tabular-nums">{indeks + 1}</td>
                  <td className="border px-2 py-1">{row.targetName}</td>
                  <td className="border px-2 py-1">{row.targetIdentity ?? "-"}</td>
                  <td className="border px-2 py-1">{row.cardNumber ?? "-"}</td>
                  <td className="border px-2 py-1">{row.cardName ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <footer className="flex justify-end pt-8">
        <div className="w-64 text-center text-sm">
          <p>Kepala Desa</p>
          <div className="h-20" />
          <p className="border-t pt-1">(..................................)</p>
        </div>
      </footer>
    </div>
  );
}
