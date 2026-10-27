import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { listLampiranDtksUseCase } from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE } from "@/features/penduduk/domain/dtks";
import { LampiranManager } from "@/features/penduduk/presentation/components/dtks/lampiran-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Lampiran DTKS",
};

export default async function LampiranDtksPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, DTKS_RESOURCE, "read")) {
    return <NoAccess title="Lampiran DTKS" description="Bukti pendukung formulir DTKS." />;
  }

  const villageId = await resolveVillageId(user);
  const canManage = hasPermission(user.permissions, DTKS_RESOURCE, "update");
  const lampiran = await listLampiranDtksUseCase(villageId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lampiran DTKS"
        description="Bukti pendukung DTKS seperti foto KK, KTP, atau dokumen pendukung lain."
        actions={
          <Button variant="outline" asChild>
            <Link href="/penduduk/dtks">
              <ArrowLeft className="size-4" />
              Daftar DTKS
            </Link>
          </Button>
        }
      />

      <LampiranManager
        canManage={canManage}
        lampiran={lampiran.map((item) => ({
          id: item.id,
          nama: item.nama,
          berkas: item.berkas,
          keterangan: item.keterangan,
          dibuat: item.createdAt.toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          url: `/api/publik/media/${villageId}/${item.berkas}`,
        }))}
      />
    </div>
  );
}
