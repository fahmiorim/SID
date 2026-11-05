import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { listSimbolUseCases } from "@/features/gis/application/use-cases";
import { SIMBOL_RESOURCE } from "@/features/gis/domain/gis";
import {
  createSimbolAction,
  deleteSimbolAction,
  updateSimbolAction,
} from "@/features/gis/presentation/actions";
import { EntityManager } from "@/features/gis/presentation/components/entity-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Simbol Peta",
};

export default async function SimbolPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SIMBOL_RESOURCE, "read")) {
    return <NoAccess title="Simbol Peta" description="Kelola katalog simbol/ikon peta desa." />;
  }

  const simbols = await listSimbolUseCases();
  const rows = simbols.map((simbol) => ({
    id: simbol.id,
    simbol: simbol.simbol,
    desk: simbol.desk,
    sortOrder: simbol.sortOrder,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simbol Peta"
        description="Katalog simbol/ikon yang digunakan pada layer peta."
      />

      <EntityManager
        entityName="Simbol Peta"
        addLabel="Tambah Simbol"
        rows={rows}
        columns={[
          { key: "simbol", label: "Simbol" },
          { key: "desk", label: "Keterangan" },
          { key: "sortOrder", label: "Urutan", format: "number" },
        ]}
        fields={[
          { name: "simbol", label: "Nama Simbol", required: true, maxLength: 40 },
          { name: "desk", label: "Keterangan", type: "textarea" },
          { name: "sortOrder", label: "Urutan", type: "number" },
        ]}
        emptyText="Belum ada simbol peta."
        actions={{
          create: createSimbolAction,
          update: updateSimbolAction,
          remove: deleteSimbolAction,
        }}
        canWrite={hasPermission(user.permissions, SIMBOL_RESOURCE, "update")}
        canDelete={hasPermission(user.permissions, SIMBOL_RESOURCE, "delete")}
      />
    </div>
  );
}
