import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { getPendudukDetailById } from "@/features/penduduk/infrastructure/penduduk-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function PendudukDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.penduduk, "read")) {
    return <NoAccess title="Detail Penduduk" description="Biodata penduduk." />;
  }
  const villageId = await resolveVillageId(user);
  const { id } = await params;
  const detail = await getPendudukDetailById(villageId, Number(id));

  if (!detail) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Detail Penduduk" description="Data tidak ditemukan" />
      </div>
    );
  }

  const r = detail.resident;
  const gender = r.gender === "male" ? "Laki-laki" : r.gender === "female" ? "Perempuan" : r.gender;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Biodata Penduduk" description={r.name} />
      <div className="flex gap-2">
        <Link
          href={`/penduduk/${r.id}/cetak`}
          target="_blank"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Cetak Biodata
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border">
          <div className="border-b p-3 font-medium">Data Pokok</div>
          <dl className="grid grid-cols-2 gap-2 p-3 text-sm">
            <dt className="text-muted-foreground">NIK</dt>
            <dd>{r.nationalId ?? "-"}</dd>
            <dt className="text-muted-foreground">Nama</dt>
            <dd>{r.name}</dd>
            <dt className="text-muted-foreground">Jenis Kelamin</dt>
            <dd>{gender}</dd>
            <dt className="text-muted-foreground">Tempat/Tgl Lahir</dt>
            <dd>
              {r.birthPlace ?? "-"} / {r.birthDate ?? "-"}
            </dd>
            <dt className="text-muted-foreground">Agama</dt>
            <dd>{detail.religion?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Pendidikan</dt>
            <dd>{detail.education?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Pekerjaan</dt>
            <dd>{detail.occupation?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Status Kawin</dt>
            <dd>{detail.maritalStatus?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Gol. Darah</dt>
            <dd>{detail.bloodType?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Warga Negara</dt>
            <dd>{detail.citizenship?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Status Penduduk</dt>
            <dd>{r.lifeStatus}</dd>
          </dl>
        </div>
        <div className="rounded-md border">
          <div className="border-b p-3 font-medium">Keluarga & Alamat</div>
          <dl className="grid grid-cols-2 gap-2 p-3 text-sm">
            <dt className="text-muted-foreground">No. KK</dt>
            <dd>{detail.family?.number ?? "-"}</dd>
            <dt className="text-muted-foreground">Hub. Keluarga</dt>
            <dd>{detail.familyRelation?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Dusun/RW/RT</dt>
            <dd>
              {detail.region?.dusun ?? "-"} / {detail.region?.rw ?? "-"} /{" "}
              {detail.region?.rt ?? "-"}
            </dd>
            <dt className="text-muted-foreground">Alamat</dt>
            <dd>{r.address ?? "-"}</dd>
            <dt className="text-muted-foreground">Telepon</dt>
            <dd>{r.phone ?? "-"}</dd>
            <dt className="text-muted-foreground">Nama Ayah</dt>
            <dd>{r.fatherName ?? "-"}</dd>
            <dt className="text-muted-foreground">Nama Ibu</dt>
            <dd>{r.motherName ?? "-"}</dd>
            <dt className="text-muted-foreground">NIK Ayah</dt>
            <dd>{r.fatherNationalId ?? "-"}</dd>
            <dt className="text-muted-foreground">NIK Ibu</dt>
          </dl>
        </div>
      </div>
    </div>
  );
}
