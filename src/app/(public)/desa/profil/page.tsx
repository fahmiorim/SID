import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profil Desa" };

export default async function ProfilDesaPage() {
  const desa = await getIdentitasFromRequest();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profil Desa</h1>
        <p className="text-muted-foreground">
          Gambaran umum wilayah, visi & misi, serta kondisi desa.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Identitas Wilayah</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label="Nama Desa" value={desa.namaDesa} />
              <Item label="Kode Desa" value={desa.kodeDesa} />
              <Item label="Kecamatan" value={desa.namaKecamatan} />
              <Item label="Kabupaten/Kota" value={desa.namaKabupaten} />
              <Item label="Provinsi" value={desa.namaPropinsi} />
              <Item label="Kode Pos" value={desa.kodePos} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kantor Desa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Item label="Alamat" value={desa.alamatKantor} />
            <Item label="Kepala Desa" value={desa.namaKepalaDesa} />
            <Item label="NIP" value={desa.nipKepalaDesa} />
            <Item label="Telepon" value={desa.telepon} />
            <Item label="Email" value={desa.emailDesa} />
            <Item label="Website" value={desa.website} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Visi desa belum diatur. Pengelola desa dapat menambahkannya melalui panel admin (menu
              Konten → Profil).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Misi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Misi desa belum diatur. Pengelola desa dapat menambahkannya melalui panel admin (menu
              Konten → Profil).
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value?.trim() || "—"}</dd>
    </div>
  );
}
