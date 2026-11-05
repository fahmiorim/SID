import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import {
  listAllPolygonUseCases,
  listPointUseCases,
  listSimbolUseCases,
} from "@/features/gis/application/use-cases";
import { POINT_RESOURCE } from "@/features/gis/domain/gis";
import {
  createPointAction,
  deletePointAction,
  updatePointAction,
} from "@/features/gis/presentation/actions";
import { EntityManager } from "@/features/gis/presentation/components/entity-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Titik Peta",
};

export default async function PointPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, POINT_RESOURCE, "read")) {
    return <NoAccess title="Titik Peta" description="Kelola titik/lokasi pada peta desa." />;
  }

  const [points, polygons, simbols] = await Promise.all([
    listPointUseCases(),
    listAllPolygonUseCases(),
    listSimbolUseCases(),
  ]);

  const rows = points.map((point) => ({
    id: point.id,
    nama: point.nama,
    simbol: point.simbol,
    parrent: point.parrent,
    layer: polygons.find((polygon) => polygon.id === point.parrent)?.nama ?? "—",
    tipe: point.tipe,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Titik Peta" description="Titik/lokasi peta dalam format GeoJSON Point." />

      <EntityManager
        entityName="Titik Peta"
        addLabel="Tambah Titik"
        rows={rows}
        columns={[
          { key: "nama", label: "Nama Titik" },
          { key: "simbol", label: "Simbol" },
          { key: "layer", label: "Layer" },
          { key: "tipe", label: "Tipe", format: "number" },
        ]}
        fields={[
          { name: "nama", label: "Nama Titik", required: true, maxLength: 50 },
          {
            name: "simbol",
            label: "Simbol",
            type: "select",
            options: simbols.map((simbol) => ({
              value: simbol.simbol,
              label: simbol.simbol,
            })),
            placeholder: "— Tanpa simbol —",
          },
          {
            name: "parrent",
            label: "Layer Polygon",
            type: "select",
            options: polygons.map((polygon) => ({
              value: String(polygon.id),
              label: polygon.nama,
            })),
            placeholder: "— Tanpa layer —",
          },
          { name: "tipe", label: "Tipe", type: "number" },
          {
            name: "path",
            label: "Path GeoJSON (Point)",
            type: "textarea",
            placeholder: '{"type":"Point","coordinates":[110.5,-7.5]}',
          },
        ]}
        emptyText="Belum ada titik peta."
        actions={{
          create: createPointAction,
          update: updatePointAction,
          remove: deletePointAction,
        }}
        canWrite={hasPermission(user.permissions, POINT_RESOURCE, "update")}
        canDelete={hasPermission(user.permissions, POINT_RESOURCE, "delete")}
      />
    </div>
  );
}
