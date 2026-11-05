import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { listGarisUseCases } from "@/features/gis/application/use-cases";
import { GARIS_RESOURCE } from "@/features/gis/domain/gis";
import {
  createGarisAction,
  deleteGarisAction,
  updateGarisAction,
} from "@/features/gis/presentation/actions";
import { EntityManager } from "@/features/gis/presentation/components/entity-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Garis Peta",
};

export default async function GarisPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, GARIS_RESOURCE, "read")) {
    return <NoAccess title="Garis Peta" description="Kelola garis/jalan pada peta desa." />;
  }

  const garisList = await listGarisUseCases();
  const rows = garisList.map((garis) => ({
    id: garis.id,
    nama: garis.nama,
    refLine: garis.refLine,
    refNama: garisList.find((item) => item.id === garis.refLine)?.nama ?? "—",
    desk: garis.desk,
    sortOrder: garis.sortOrder,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garis Peta"
        description="Garis/jalan peta dalam format GeoJSON LineString."
      />

      <EntityManager
        entityName="Garis Peta"
        addLabel="Tambah Garis"
        rows={rows}
        columns={[
          { key: "nama", label: "Nama Garis" },
          { key: "refNama", label: "Garis Induk" },
          { key: "desk", label: "Keterangan" },
        ]}
        fields={[
          { name: "nama", label: "Nama Garis", required: true, maxLength: 50 },
          {
            name: "refLine",
            label: "Garis Induk",
            type: "select",
            options: garisList.map((garis) => ({
              value: String(garis.id),
              label: garis.nama,
            })),
            placeholder: "— Tanpa induk —",
          },
          {
            name: "path",
            label: "Path GeoJSON (LineString)",
            type: "textarea",
            placeholder: '{"type":"LineString","coordinates":[[110,-7],[111,-8]]}',
          },
          { name: "foto", label: "Foto", maxLength: 100 },
          { name: "desk", label: "Keterangan", type: "textarea" },
          { name: "sortOrder", label: "Urutan", type: "number" },
        ]}
        emptyText="Belum ada garis peta."
        actions={{
          create: createGarisAction,
          update: updateGarisAction,
          remove: deleteGarisAction,
        }}
        canWrite={hasPermission(user.permissions, GARIS_RESOURCE, "update")}
        canDelete={hasPermission(user.permissions, GARIS_RESOURCE, "delete")}
      />
    </div>
  );
}
