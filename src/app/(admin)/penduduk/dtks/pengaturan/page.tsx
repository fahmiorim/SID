import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { listProgramDtksUseCase } from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE } from "@/features/penduduk/domain/dtks";
import { ProgramManager } from "@/features/penduduk/presentation/components/dtks/program-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pengaturan Program DTKS",
};

export default async function PengaturanProgramDtksPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, DTKS_RESOURCE, "read")) {
    return (
      <NoAccess title="Pengaturan Program DTKS" description="Program bansos yang terikat DTKS." />
    );
  }

  const villageId = await resolveVillageId(user);
  const canManage = hasPermission(user.permissions, DTKS_RESOURCE, "update");
  const program = await listProgramDtksUseCase(villageId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Program DTKS"
        description="Daftar program bantuan sosial yang dipakai dalam pendataan DTKS desa."
        actions={
          <Button variant="outline" asChild>
            <Link href="/penduduk/dtks">
              <ArrowLeft className="size-4" />
              Daftar DTKS
            </Link>
          </Button>
        }
      />

      <ProgramManager
        canManage={canManage}
        program={program.map((item) => ({
          id: item.id,
          kodeProgram: item.kodeProgram,
          namaProgram: item.namaProgram,
          aktif: item.aktif === 1,
        }))}
      />
    </div>
  );
}
