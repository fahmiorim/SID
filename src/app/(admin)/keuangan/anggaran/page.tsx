import { BookOpen, Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminListPanel, AdminStat } from "@/components/layout/admin-list";
import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { listKeuangan } from "@/features/keuangan/application/keuangan-use-cases";
import {
  formatRupiah,
  KEUANGAN_RESOURCE,
  ringkasRpApbd,
} from "@/features/keuangan/domain/keuangan";
import { AnggaranTable } from "@/features/keuangan/presentation/components/anggaran-table";
import { ApbdesImportDialog } from "@/features/keuangan/presentation/components/apbdes-import-dialog";
import { ApbdesTemplateButton } from "@/features/keuangan/presentation/components/apbdes-template-button";
import { LaporanPrintButton } from "@/features/keuangan/presentation/components/laporan-print-button";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "APBDes",
};

export default async function AnggaranPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KEUANGAN_RESOURCE, "read")) {
    return <NoAccess title="Keuangan" description="Kelola APBDes dan realisasinya." />;
  }

  const params = await searchParams;
  const tahunParam = params.tahun ? Number(params.tahun) : undefined;
  const [{ tahun, tersedia, rows }, desa] = await Promise.all([
    listKeuangan(tahunParam),
    getIdentitas(),
  ]);
  const canManage = hasPermission(user.permissions, KEUANGAN_RESOURCE, "update");

  const ringkas = ringkasRpApbd(rows);
  const tahunList = [...new Set([...tersedia, tahun])].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        title="APBDes"
        description="Pagu anggaran dan realisasi per rekening (Siskeudes)."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/anggaran?tahun=${item}`}
                aria-current={item === tahun ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors ${
                  item === tahun
                    ? "border-transparent bg-[var(--brand)] text-[var(--brand-foreground)] shadow-sm"
                    : "border-black/10 bg-white/70 text-muted-foreground hover:border-[var(--brand)]/25 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                }`}
              >
                {item}
              </Link>
            ))}
            <Button variant="outline" asChild>
              <Link href={`/keuangan/rekonsiliasi?tahun=${tahun}`}>
                <Scale className="size-4" />
                Rekonsiliasi
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/keuangan/pembukuan">
                <BookOpen className="size-4" />
                Pembukuan
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/keuangan/sisa-lebih">
                <Wallet className="size-4" />
                SiLPA
              </Link>
            </Button>
            {canManage && (
              <>
                <ApbdesTemplateButton />
                <ApbdesImportDialog tahunDefault={tahun} tahunList={tahunList} />
              </>
            )}
            <LaporanPrintButton />
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Pagu &amp; Realisasi APBDes</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
        <p className="text-sm">Tahun Anggaran {tahun}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStat
          utama
          label="Pendapatan"
          nilai={formatRupiah(ringkas.pendapatan)}
          keterangan={`Tahun anggaran ${tahun}`}
          ikon={TrendingUp}
        />
        <AdminStat
          label="Belanja"
          nilai={formatRupiah(ringkas.belanja)}
          keterangan="Pagu belanja daerah"
          ikon={TrendingDown}
        />
        <AdminStat
          label="Pembiayaan (netto)"
          nilai={formatRupiah(ringkas.pembiayaan)}
          keterangan="Penerimaan dikurangi pengeluaran"
          ikon={Scale}
        />
        <AdminStat
          label="Surplus / Defisit"
          nilai={formatRupiah(ringkas.surplus)}
          keterangan="Pendapatan − belanja + pembiayaan"
          ikon={Wallet}
        />
      </section>

      <AdminListPanel
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Rincian APBDes
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pagu dan realisasi per rekening tahun {tahun}.
              </p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--brand)] ring-1 ring-black/[0.05]">
              {rows.length.toLocaleString("id-ID")} baris rekening
            </span>
          </div>
        }
      >
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm">
              Pohon rekening belum tersedia. Jalankan <code>npm run db:seed</code>.
            </p>
          </div>
        ) : (
          <AnggaranTable tahun={tahun} rows={rows} canManage={canManage} />
        )}
      </AdminListPanel>
    </div>
  );
}
