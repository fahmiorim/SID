import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { listAllPolygonUseCases, listSimbolUseCases } from "@/features/gis/application/use-cases";
import { POLYGON_RESOURCE } from "@/features/gis/domain/gis";
import {
  createPolygonAction,
  deletePolygonAction,
  updatePolygonAction,
} from "@/features/gis/presentation/actions";
import { EntityManager } from "@/features/gis/presentation/components/entity-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Kategori Peta",
};

export default async function PolygonPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, POLYGON_RESOURCE, "read")) {
    return <NoAccess title="Kategori Peta" description="Kelola kategori/layer peta desa." />;
  }

  const [polygons, simbols] = await Promise.all([listAllPolygonUseCases(), listSimbolUseCases()]);
  const rows = polygons.map((polygon) => ({
    id: polygon.id,
    nama: polygon.nama,
    tipe: polygon.tipe,
    tipeLabel: polygon.tipe === 0 ? "Root / Layer Utama" : "Sub-Polygon",
    color: polygon.color,
    sortOrder: polygon.sortOrder,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Peta"
        description="Kelola kategori atau layer peta desa (polygon utama dan sub-polygon)."
      />

      <EntityManager
        entityName="Kategori Peta"
        addLabel="Tambah Polygon"
        rows={rows}
        columns={[
          { key: "nama", label: "Nama" },
          { key: "tipeLabel", label: "Tipe" },
          { key: "color", label: "Warna" },
          { key: "sortOrder", label: "Urutan", format: "number" },
        ]}
        fields={[
          { name: "nama", label: "Nama Polygon", required: true, maxLength: 50 },
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
            name: "color",
            label: "Warna (HEX)",
            placeholder: "#10b981",
            maxLength: 7,
          },
          {
            name: "tipe",
            label: "Tipe",
            type: "select",
            required: true,
            options: [
              { value: "0", label: "Root / Layer Utama" },
              { value: "1", label: "Sub-Polygon" },
            ],
          },
          {
            name: "parrent",
            label: "Polygon Induk",
            type: "select",
            options: polygons.map((polygon) => ({
              value: String(polygon.id),
              label: polygon.nama,
            })),
            placeholder: "— Tanpa induk —",
          },
          { name: "sortOrder", label: "Urutan", type: "number" },
        ]}
        emptyText="Belum ada kategori peta."
        actions={{
          create: createPolygonAction,
          update: updatePolygonAction,
          remove: deletePolygonAction,
        }}
        canWrite={hasPermission(user.permissions, POLYGON_RESOURCE, "update")}
        canDelete={hasPermission(user.permissions, POLYGON_RESOURCE, "delete")}
      />
    </div>
  );
}
