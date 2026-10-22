import { urlMedia } from "@/features/publik/domain/format";
import type { PerangkatProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Pemerintahan: SOTK desa beserta perangkatnya. */
export function EsensiPerangkat({ ctx, perangkat }: PerangkatProps) {
  const desa = ctx.desa;

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Pemerintahan Desa"
        description={`Susunan organisasi dan tata kerja (SOTK) ${desa.namaDesa ?? "desa"}.`}
      />

      <ThemeCard className="p-6">
        <h2 className="text-base font-semibold">Kepala Desa</h2>
        <p className="mt-2 text-lg font-medium">{desa.namaKepalaDesa ?? "Belum diatur"}</p>
        {desa.nipKepalaDesa ? (
          <p className="text-sm text-muted-foreground">NIP {desa.nipKepalaDesa}</p>
        ) : null}
      </ThemeCard>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Perangkat Desa</h2>
        {perangkat.length === 0 ? (
          <ThemeEmpty>Data perangkat desa belum diisi.</ThemeEmpty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perangkat.map((orang) => {
              const foto = urlMedia(orang.foto);
              return (
                <ThemeCard as="li" key={orang.id}>
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto}
                      alt={orang.nama}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-muted text-3xl font-semibold text-muted-foreground">
                      {(orang.nama.charAt(0) || "?").toUpperCase()}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-medium">{orang.nama}</p>
                    <p className="tema-link-primary text-sm">{orang.jabatan ?? "—"}</p>
                    {orang.nip ? (
                      <p className="mt-1 text-xs text-muted-foreground">NIP {orang.nip}</p>
                    ) : null}
                  </div>
                </ThemeCard>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
