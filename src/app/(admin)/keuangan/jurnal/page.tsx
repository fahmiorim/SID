import { ArrowLeft, BookOpen, Landmark } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getJurnalPembukuan } from "@/features/keuangan/application/jurnal-use-cases";
import { formatRupiah, KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import { JurnalManager } from "@/features/keuangan/presentation/components/jurnal-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Jurnal & Saldo Bank" };

export default async function JurnalPembukuanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KEUANGAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Jurnal & Saldo Bank"
        description="Anda tidak memiliki akses untuk melihat jurnal umum dan saldo bank desa."
      />
    );
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const { tahun, tersedia, rows, ringkas, saldoBank, totalSaldoAwal } =
    await getJurnalPembukuan(tahunParam);

  const canWrite = hasPermission(user.permissions, KEUANGAN_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, KEUANGAN_RESOURCE, "delete");
  const tahunList = [...new Set([...tersedia, tahun])].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jurnal & Saldo Bank"
        description="Pembukuan berpasangan: mutasi debet/kredit per kode rekening beserta saldo awal rekening bank."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/jurnal?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums ${item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"}`}
              >
                {item}
              </Link>
            ))}
            <Button variant="outline" asChild>
              <Link href="/keuangan/pembukuan">
                <ArrowLeft className="size-4" />
                Pembukuan Manual
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BookOpen className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total debet</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatRupiah(ringkas.totalDebet)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BookOpen className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total kredit</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatRupiah(ringkas.totalKredit)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Landmark className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Saldo jurnal</p>
              <p
                className={`text-lg font-semibold tabular-nums ${
                  ringkas.saldo.startsWith("-") ? "text-destructive" : ""
                }`}
              >
                {formatRupiah(ringkas.saldo)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Landmark className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Saldo awal bank</p>
              <p className="text-lg font-semibold tabular-nums">{formatRupiah(totalSaldoAwal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <JurnalManager
        tahun={tahun}
        rows={rows.map((row) => ({
          id: row.id,
          tahun: row.tahun,
          tanggal: row.tanggal,
          kodeRekening: row.kodeRekening,
          uraian: row.uraian,
          debet: row.debet,
          kredit: row.kredit,
          sumber: row.sumber,
          referensi: row.referensi,
        }))}
        saldoBank={saldoBank.map((row) => ({
          id: row.id,
          tahun: row.tahun,
          rekeningBank: row.rekeningBank,
          namaBank: row.namaBank,
          saldoAwal: row.saldoAwal,
        }))}
        canWrite={canWrite}
        canManage={canManage}
        today={new Date().toISOString().slice(0, 10)}
      />

      <p className="text-xs text-muted-foreground print:hidden">
        Saldo jurnal = total debet − total kredit tahun terpilih. Saldo awal bank hanya mencatat
        pembukaan rekening, bukan mutasi rekening koran. Lihat juga{" "}
        <Link className="underline" href="/keuangan/pembukuan">
          Pembukuan Manual
        </Link>{" "}
        dan{" "}
        <Link className="underline" href="/keuangan/rekonsiliasi">
          Rekonsiliasi
        </Link>
        .
      </p>
    </div>
  );
}
