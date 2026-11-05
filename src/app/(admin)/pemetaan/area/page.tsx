import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { listAllPolygonUseCases, listAreaUseCases } from "@/features/gis/application/use-cases";
import { AREA_RESOURCE } from "@/features/gis/domain/gis";
import {
  createAreaAction,
  deleteAreaAction,
  updateAreaAction,
} from "@/features/gis/presentation/actions";
import { EntityManager } from "@/features/gis/presentation/components/entity-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Area Peta",
};

export default async function AreaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, AREA_RESOURCE, "read")) {
    return <NoAccess title="Area Peta" description="Kelola area peta desa berdasarkan polygon." />;
  }

  const [areas, polygons] = await Promise.all([listAreaUseCases(), listAllPolygonUseCases()]);

  const rows = areas.map((area) => ({
    id: area.id,
    nama: area.nama,
    refPolygon: area.refPolygon,
    namaPolygon: polygons.find((polygon) => polygon.id === area.refPolygon)?.nama ?? "—",
    desk: area.desk,
    sortOrder: area.sortOrder,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Area Peta"
        description="Area/wilayah peta yang merujuk ke kategori polygon."
      />

      <EntityManager
        entityName="Area Peta"
        addLabel="Tambah Area"
        rows={rows}
        columns={[
          { key: "nama", label: "Nama Area" },
          { key: "namaPolygon", label: "Kategori Polygon" },
          { key: "desk", label: "Keterangan" },
        ]}
        fields={[
          { name: "nama", label: "Nama Area", required: true, maxLength: 50 },
          {
            name: "refPolygon",
            label: "Kategori Polygon",
            type: "select",
            options: polygons.map((polygon) => ({
              value: String(polygon.id),
              label: polygon.nama,
            })),
            placeholder: "— Tanpa kategori —",
          },
          {
            name: "path",
            label: "Path GeoJSON (Polygon)",
            type: "textarea",
            placeholder: '{"type":"Polygon","coordinates":[[[110,-7],[111,-7],[111,-8],[110,-7]]]}',
          },
          { name: "foto", label: "Foto", maxLength: 100 },
          { name: "desk", label: "Keterangan", type: "textarea" },
          { name: "sortOrder", label: "Urutan", type: "number" },
        ]}
        emptyText="Belum ada area peta. Tambahkan area setelah kategori polygon dibuat."
        actions={{
          create: createAreaAction,
          update: updateAreaAction,
          remove: deleteAreaAction,
        }}
        canWrite={hasPermission(user.permissions, AREA_RESOURCE, "update")}
        canDelete={hasPermission(user.permissions, AREA_RESOURCE, "delete")}
      />
    </div>
  );
}
