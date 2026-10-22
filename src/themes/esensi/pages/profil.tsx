import type { ProfilProps } from "@/themes/types";
import { ThemeCard, ThemePageHeader, ThemeProse } from "@/themes/ui";

/** Profil desa (visi, misi, sejarah, sambutan, koordinat). */
export function EsensiProfil({ ctx, profil }: ProfilProps) {
  const desa = ctx.desa;
  const misi = profil?.misi ?? [];

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Profil Desa"
        description={`Gambaran umum wilayah, visi & misi, serta kondisi ${desa.namaDesa ?? "desa"}.`}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <ThemeCard className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Identitas Wilayah</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Item label="Nama Desa" value={desa.namaDesa} />
            <Item label="Kode Desa" value={desa.kodeDesa} />
            <Item label="Kecamatan" value={desa.namaKecamatan} />
            <Item label="Kabupaten/Kota" value={desa.namaKabupaten} />
            <Item label="Provinsi" value={desa.namaPropinsi} />
            <Item label="Kode Pos" value={desa.kodePos} />
          </dl>
        </ThemeCard>

        <ThemeCard className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Kantor Desa</h2>
          <Item label="Alamat" value={desa.alamatKantor} />
          <Item label="Kepala Desa" value={desa.namaKepalaDesa} />
          <Item label="NIP" value={desa.nipKepalaDesa} />
          <Item label="Telepon" value={desa.telepon} />
          <Item label="Email" value={desa.emailDesa} />
        </ThemeCard>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ThemeCard className="p-6">
          <h2 className="text-base font-semibold">Visi</h2>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">
            {profil?.visi?.trim() || "Visi desa belum diatur."}
          </p>
        </ThemeCard>
        <ThemeCard className="p-6">
          <h2 className="text-base font-semibold">Misi</h2>
          {misi.length > 0 ? (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {misi.map((butir) => (
                <li key={butir}>{butir}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Misi desa belum diatur.</p>
          )}
        </ThemeCard>
      </section>

      {profil?.sejarah ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Sejarah Desa</h2>
          <ThemeProse html={profil.sejarah} />
        </section>
      ) : null}

      {profil?.koordinat ? (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Lokasi</h2>
          <p className="text-sm text-muted-foreground">Koordinat: {profil.koordinat}</p>
          <a
            className="tema-link-primary text-sm underline-offset-4 hover:underline"
            href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(
              profil.koordinat.split(",")[0]?.trim() ?? "",
            )}&mlon=${encodeURIComponent(profil.koordinat.split(",")[1]?.trim() ?? "")}#map=15`}
            target="_blank"
            rel="noopener noreferrer"
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
