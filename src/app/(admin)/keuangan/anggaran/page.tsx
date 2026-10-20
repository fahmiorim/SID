import { Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listKeuangan } from "@/features/keuangan/application/keuangan-use-cases";
import {
  formatRupiah,
  KEUANGAN_RESOURCE,
  ringkasRpApbd,
} from "@/features/keuangan/domain/keuangan";
import { AnggaranTable } from "@/features/keuangan/presentation/components/anggaran-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

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
  const { tahun, tersedia, rows } = await listKeuangan(tahunParam);
  const canManage = hasPermission(user.permissions, KEUANGAN_RESOURCE, "update");

  const ringkas = ringkasRpApbd(rows);
  const tahunList = [...new Set([...tersedia, tahun])].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        title="APBDes"
        description="Pagu anggaran dan realisasi per rekening (Siskeudes)."
        actions={
          <div className="flex items-center gap-2">
            {tahunList.map((item) => (
              <Link
                key={item}
                href={`/keuangan/anggaran?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors ${
                  item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pendapatan", value: ringkas.pendapatan },
          { label: "Belanja", value: ringkas.belanja },
          { label: "Pembiayaan (netto)", value: ringkas.pembiayaan },
          { label: "Surplus / Defisit", value: ringkas.surplus },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold tabular-nums">{formatRupiah(item.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Wallet className="size-5" />
              <p className="text-sm">
                Pohon rekening belum tersedia. Jalankan <code>npm run db:seed</code>.
              </p>
            </div>
          ) : (
            <AnggaranTable tahun={tahun} rows={rows} canManage={canManage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
