import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPembukuanData } from "@/features/keuangan/application/pembukuan-use-cases";
import { formatRupiah, KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import { PembukuanManager } from "@/features/keuangan/presentation/components/pembukuan-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Pembukuan Manual" };

export default async function PembukuanPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KEUANGAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pembukuan Manual"
        description="Anda tidak memiliki akses untuk melihat pembukuan manual kas desa."
      />
    );
  }

  const { rows, ringkas } = await getPembukuanData();
  const canWrite = hasPermission(user.permissions, KEUANGAN_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, KEUANGAN_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pembukuan Manual"
        description="Catatan kas masuk dan keluar desa di luar pagu APBDes (buku kas umum sederhana)."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/keuangan/anggaran">
                <ArrowLeft className="size-4" />
                Kembali ke APBDes
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Total pendapatan</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatRupiah(ringkas.totalPendapatan)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Total belanja</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatRupiah(ringkas.totalBelanja)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Saldo berjalan</p>
            <p
              className={`text-lg font-semibold tabular-nums ${
                ringkas.saldo.startsWith("-") ? "text-destructive" : ""
              }`}
            >
              {formatRupiah(ringkas.saldo)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BookOpen className="size-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Jumlah transaksi</p>
              <p className="text-lg font-semibold tabular-nums">{ringkas.jumlah}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PembukuanManager
        rows={rows}
        canWrite={canWrite}
        canManage={canManage}
        today={new Date().toISOString().slice(0, 10)}
      />

      <p className="text-xs text-muted-foreground print:hidden">
        Pembukuan ini mencatat transaksi manual dan menghitung saldo berjalan dari selisih
        pendapatan dan belanja. Angka ini tidak mengubah pagu APBDes dan bukan saldo rekening koran
        bank — bandingkan dengan laporan APBDes lewat halaman{" "}
        <Link className="underline" href="/keuangan/rekonsiliasi">
          Rekonsiliasi
        </Link>
        .
      </p>
    </div>
  );
}
