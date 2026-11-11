import { susunBaganSotk } from "@/features/konten/domain/sotk";
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

      {(() => {
        const mapped = perangkat.map((p) => ({
          ...p,
          status: "aktif" as const,
          nik: null,
          jenisKelamin: null,
          tempatLahir: null,
          tanggalLahir: null,
          penandaTangan: false,
          jabatanId: null,
        }));
        const { kepala, sekretaris, staf } = susunBaganSotk(mapped);
        if (kepala === null) return null;
        return (
          <details className="rounded-lg border p-4" open>
            <summary className="cursor-pointer font-semibold">Bagan SOTK</summary>
            <div className="mt-4 space-y-4">
              <TreeNode node={kepala} isRoot />
              {sekretaris !== null ? (
                <ul className="ml-8 space-y-2 border-l-2 border-muted pl-6">
                  <li>
                    <TreeNode node={sekretaris} />
                  </li>
                </ul>
              ) : null}
              {staf.length > 0 ? (
                <ul className="ml-8 space-y-2 border-l-2 border-muted pl-6">
                  {staf.map((s) => (
                    <li key={s.id}>
                      <TreeNode node={s} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </details>
        );
      })()}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Perangkat Desa</h2>
        {perangkat.length === 0 ? (
          <ThemeEmpty>Data perangkat desa belum diisi.</ThemeEmpty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perangkat.map((orang) => {
              const foto = urlMedia(orang.foto);
              const inisial =
                orang.nama
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((bagian) => bagian.charAt(0))
                  .join("")
                  .toUpperCase() || "?";
              return (
                <ThemeCard
                  as="li"
                  key={orang.id}
                  className="flex items-center gap-4 p-4 sm:block sm:p-0"
                >
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto}
                      alt={orang.nama}
                      className="size-24 shrink-0 rounded-[calc(var(--pub-radius)*0.8)] object-cover sm:aspect-square sm:h-auto sm:w-full sm:rounded-none"
                    />
                  ) : (
                    <div
                      className="flex size-24 shrink-0 items-center justify-center rounded-[calc(var(--pub-radius)*0.8)] text-2xl font-bold text-white sm:aspect-square sm:h-auto sm:w-full sm:rounded-none sm:text-4xl"
                      style={{
                        backgroundImage:
                          "linear-gradient(140deg, var(--pub-primary-text), color-mix(in srgb, var(--pub-primary) 68%, #000000))",
                      }}
                      aria-hidden="true"
                    >
                      {inisial}
                    </div>
                  )}
                  <div className="min-w-0 sm:p-4">
                    <p className="leading-snug font-medium">{orang.nama}</p>
                    <p className="tema-link-primary text-sm">{orang.jabatan ?? "—"}</p>
                    {orang.nip ? (
                      <p className="mt-1 text-xs text-muted-foreground">NIP {orang.nip}</p>
                    ) : null}
                    {orang.periode ? (
                      <p className="mt-1 text-xs text-muted-foreground">Periode {orang.periode}</p>
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

function TreeNode({
  node,
  isRoot,
}: {
  node: { id: number; nama: string; jabatan: string | null };
  isRoot?: boolean;
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="font-medium">{node.nama}</p>
      <p className="text-sm text-muted-foreground">{node.jabatan ?? "—"}</p>
      {isRoot ? <p className="mt-1 text-xs text-muted-foreground">(Kepala Desa)</p> : null}
    </div>
  );
}
