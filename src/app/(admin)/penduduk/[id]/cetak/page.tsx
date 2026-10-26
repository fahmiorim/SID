import {
  getIdentitasFromRequest,
  resolveVillageId,
} from "@/features/desa/application/resolve-village";
import { getPendudukDetailById } from "@/features/penduduk/infrastructure/penduduk-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function CetakBiodataPendudukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.penduduk, "read")) {
    return <div className="p-6">Tidak memiliki izin.</div>;
  }
  const villageId = await resolveVillageId(user);
  const desa = await getIdentitasFromRequest();
  const { id } = await params;
  const detail = await getPendudukDetailById(villageId, Number(id));

  if (!detail) {
    return <div className="p-6">Data tidak ditemukan</div>;
  }

  const r = detail.resident;
  const gender = r.gender === "male" ? "Laki-laki" : r.gender === "female" ? "Perempuan" : r.gender;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6 print:p-4">
      <header className="text-center">
        <h1 className="text-lg font-semibold">BIODATA PENDUDUK</h1>
        <p className="text-sm">{desa.namaDesa ?? "-"}</p>
      </header>
      <section className="rounded border">
        <div className="border-b px-3 py-2 font-medium">DATA DIRI</div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="w-1/3 px-3 py-1">NIK</td>
              <td className="px-3 py-1">{r.nationalId ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Nama Lengkap</td>
              <td className="px-3 py-1">{r.name}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Jenis Kelamin</td>
              <td className="px-3 py-1">{gender}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Tempat/Tanggal Lahir</td>
              <td className="px-3 py-1">
                {r.birthPlace ?? "-"} / {r.birthDate ?? "-"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Agama</td>
              <td className="px-3 py-1">{detail.religion?.name ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Pendidikan</td>
              <td className="px-3 py-1">{detail.education?.name ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Pekerjaan</td>
              <td className="px-3 py-1">{detail.occupation?.name ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Status Perkawinan</td>
              <td className="px-3 py-1">{detail.maritalStatus?.name ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Golongan Darah</td>
              <td className="px-3 py-1">{detail.bloodType?.name ?? "-"}</td>
            </tr>
            <tr>
              <td className="px-3 py-1">Warga Negara</td>
              <td className="px-3 py-1">{detail.citizenship?.name ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="rounded border">
        <div className="border-b px-3 py-2 font-medium">KELUARGA & ALAMAT</div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="w-1/3 px-3 py-1">No. KK</td>
              <td className="px-3 py-1">{detail.family?.number ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Hubungan Keluarga</td>
              <td className="px-3 py-1">{detail.familyRelation?.name ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Dusun/RW/RT</td>
              <td className="px-3 py-1">
                {detail.region?.dusun ?? "-"} / {detail.region?.rw ?? "-"} /{" "}
                {detail.region?.rt ?? "-"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Alamat</td>
              <td className="px-3 py-1">{r.address ?? "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-1">Nama Ayah</td>
              <td className="px-3 py-1">{r.fatherName ?? "-"}</td>
            </tr>
            <tr>
              <td className="px-3 py-1">Nama Ibu</td>
              <td className="px-3 py-1">{r.motherName ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
