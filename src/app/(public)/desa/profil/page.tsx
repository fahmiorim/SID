import { KontenHtml } from "@/app/(public)/_components/konten-html";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { parseMisi } from "@/features/publik/domain/format";
import { getProfilDesa } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profil Desa" };

export default async function ProfilDesaPage() {
  const desa = await getIdentitasFromRequest();
  const profil = await getProfilDesa(desa.id);
  const misi = parseMisi(profil?.misi);

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
            {profil?.visi ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">{profil.visi}</p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Visi desa belum diatur. Pengelola desa dapat menambahkannya melalui panel admin
                (menu Konten → Profil).
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Misi</CardTitle>
          </CardHeader>
          <CardContent>
            {misi.length > 0 ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                {misi.map((butir) => (
                  <li key={butir}>{butir}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Misi desa belum diatur. Pengelola desa dapat menambahkannya melalui panel admin
                (menu Konten → Profil).
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {profil?.sejarah ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Sejarah Desa</h2>
          <KontenHtml html={profil.sejarah} />
        </section>
      ) : null}

      {profil?.koordinat ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Lokasi</h2>
          <p className="text-sm text-muted-foreground">Koordinat: {profil.koordinat}</p>
          <a
            href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(
              profil.koordinat.split(",")[0]?.trim() ?? "",
            )}&mlon=${encodeURIComponent(profil.koordinat.split(",")[1]?.trim() ?? "")}#map=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Lihat di peta
          </a>
        </section>
      ) : null}
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
