import type { SinergiProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Rentang pelaksanaan program; tanggal kosong tidak ditampilkan. */
function periode(mulai: string | null, selesai: string | null): string {
  if (mulai && selesai) return `${mulai} – ${selesai}`;
  return mulai || selesai || "-";
}

/** Daftar program sinergi lintas pihak yang tercatat di desa. */
export function EsensiSinergi({ ctx, program }: SinergiProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Sinergi Program"
        description={`Program lintas pihak dan mitra pembangunan yang tercatat di ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      {program.length === 0 ? (
        <ThemeEmpty>Belum ada program sinergi yang dipublikasikan.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {program.map((item) => (
            <ThemeCard as="li" key={item.id} className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-semibold">{item.nama}</h2>
                {item.tahun ? (
                  <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {item.tahun}
                  </span>
                ) : null}
              </div>

              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted-foreground">Mitra</dt>
                  <dd>{item.mitra ?? "-"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted-foreground">Periode</dt>
                  <dd>{periode(item.tanggalMulai, item.tanggalSelesai)}</dd>
                </div>
              </dl>

              {item.keterangan ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{item.keterangan}</p>
              ) : null}
            </ThemeCard>
          ))}
        </ul>
      )}
    </div>
  );
}
