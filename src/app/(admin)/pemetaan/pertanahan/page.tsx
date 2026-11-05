import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import {
  listCdesaMutasiUseCases,
  listCdesaUseCases,
  listPersilUseCases,
} from "@/features/gis/application/use-cases";
import { PERTANAHAN_RESOURCE } from "@/features/gis/domain/gis";
import {
  createCdesaAction,
  createCdesaMutasiAction,
  createPersilAction,
  deleteCdesaAction,
  deleteCdesaMutasiAction,
  deletePersilAction,
  updateCdesaAction,
  updateCdesaMutasiAction,
  updatePersilAction,
} from "@/features/gis/presentation/actions";
import { EntityManager } from "@/features/gis/presentation/components/entity-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pertanahan",
};

export default async function PertanahanPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PERTANAHAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pertanahan"
        description="Kelola data persil, Cdesa, dan mutasi tanah desa."
      />
    );
  }

  const [persil, cdesa, mutasi] = await Promise.all([
    listPersilUseCases(),
    listCdesaUseCases(),
    listCdesaMutasiUseCases(),
  ]);

  const canWrite = hasPermission(user.permissions, PERTANAHAN_RESOURCE, "update");
  const canDelete = hasPermission(user.permissions, PERTANAHAN_RESOURCE, "delete");

  const persilRows = persil.map((item) => ({
    id: item.id,
    nomor: item.nomor,
    nomorCdesa: item.nomorCdesa,
    luas: item.luas,
    status: item.status,
  }));

  const cdesaRows = cdesa.map((item) => ({
    id: item.id,
    nomor: item.nomor,
    nomorPersil: item.nomorPersil,
    nomorSertifikat: item.nomorSertifikat,
    namaPemegang: item.namaPemegang,
    luas: item.luas,
    tanggal: item.tanggal,
  }));

  const mutasiRows = mutasi.map((item) => ({
    id: item.id,
    nomor: item.nomor,
    tanggal: item.tanggal,
    tipe: item.tipe,
    cdesaId: item.cdesaId,
    cdesaNomor: cdesa.find((data) => data.id === item.cdesaId)?.nomor ?? "—",
    keterangan: item.keterangan,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pertanahan"
        description="Data persil tanah, Cdesa, dan riwayat mutasinya untuk desa ini."
      />

      <EntityManager
        entityName="Persil Tanah"
        addLabel="Tambah Persil"
        rows={persilRows}
        columns={[
          { key: "nomor", label: "No. Persil" },
          { key: "nomorCdesa", label: "No. Cdesa" },
          { key: "luas", label: "Luas (m²)", format: "number" },
          { key: "status", label: "Status" },
        ]}
        fields={[
          { name: "nomor", label: "No. Persil", required: true, maxLength: 50 },
          { name: "nomorCdesa", label: "No. Cdesa", maxLength: 50 },
          { name: "luas", label: "Luas (m²)", type: "number", step: "0.01" },
          { name: "status", label: "Status", maxLength: 30, placeholder: "milik" },
          {
            name: "path",
            label: "Path GeoJSON",
            type: "textarea",
            placeholder: '{"type":"Polygon","coordinates":[[[110,-7],[111,-7],[111,-8],[110,-7]]]}',
          },
          { name: "keterangan", label: "Keterangan", type: "textarea" },
        ]}
        emptyText="Belum ada data persil."
        actions={{
          create: createPersilAction,
          update: updatePersilAction,
          remove: deletePersilAction,
        }}
        canWrite={canWrite}
        canDelete={canDelete}
      />

      <EntityManager
        entityName="Cdesa"
        addLabel="Tambah Cdesa"
        rows={cdesaRows}
        columns={[
          { key: "nomor", label: "Nomor Cdesa" },
          { key: "nomorPersil", label: "No. Persil" },
          { key: "nomorSertifikat", label: "No. Sertifikat" },
          { key: "namaPemegang", label: "Pemegang" },
          { key: "luas", label: "Luas (m²)", format: "number" },
        ]}
        fields={[
          { name: "nomor", label: "Nomor Cdesa", required: true, maxLength: 50 },
          { name: "nomorPersil", label: "No. Persil", maxLength: 50 },
          { name: "nomorSertifikat", label: "No. Sertifikat", maxLength: 50 },
          { name: "tanggal", label: "Tanggal", type: "date" },
          { name: "namaPemegang", label: "Nama Pemegang", maxLength: 255 },
          { name: "luas", label: "Luas (m²)", type: "number", step: "0.01" },
          { name: "keterangan", label: "Keterangan", type: "textarea" },
          { name: "sortOrder", label: "Urutan", type: "number" },
        ]}
        emptyText="Belum ada data Cdesa."
        actions={{
          create: createCdesaAction,
          update: updateCdesaAction,
          remove: deleteCdesaAction,
        }}
        canWrite={canWrite}
        canDelete={canDelete}
      />

      <EntityManager
        entityName="Mutasi Cdesa"
        addLabel="Tambah Mutasi"
        rows={mutasiRows}
        columns={[
          { key: "nomor", label: "Nomor Mutasi" },
          { key: "tanggal", label: "Tanggal" },
          { key: "tipe", label: "Jenis" },
          { key: "cdesaNomor", label: "Cdesa" },
          { key: "keterangan", label: "Keterangan" },
        ]}
        fields={[
          {
            name: "cdesaId",
            label: "Cdesa",
            type: "select",
            required: true,
            options: cdesa.map((item) => ({
              value: String(item.id),
              label: `Cdesa ${item.nomor}`,
            })),
            placeholder: "— Pilih Cdesa —",
          },
          { name: "nomor", label: "Nomor Mutasi", required: true, maxLength: 50 },
          { name: "tanggal", label: "Tanggal", type: "date", required: true },
          { name: "tipe", label: "Jenis Mutasi", required: true, maxLength: 30 },
          { name: "keterangan", label: "Keterangan", type: "textarea" },
          { name: "sortOrder", label: "Urutan", type: "number" },
        ]}
        emptyText="Belum ada mutasi Cdesa."
        actions={{
          create: createCdesaMutasiAction,
          update: updateCdesaMutasiAction,
          remove: deleteCdesaMutasiAction,
        }}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  );
}
