import type { BantuanProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

const SASARAN_LABELS: Record<number, string> = {
  1: "Penduduk",
  2: "Keluarga",
  3: "Rumah Tangga",
  4: "Kelompok",
};

const ASAL_DANA_LABELS: Record<number, string> = {
  1: "APBN / Pemerintah Pusat",
  2: "APBD Provinsi",
  3: "APBD Kabupaten/Kota",
  4: "Dana Desa",
  5: "Lainnya",
};

/** Daftar program bantuan sosial. */
export function EsensiBantuan({ ctx, program }: BantuanProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Program Bantuan Sosial"
        description={`Daftar program bantuan yang dikelola ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      {program.length === 0 ? (
        <ThemeEmpty>Belum ada program bantuan yang tercatat.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {program.map((item) => (
            <ThemeCard as="li" key={item.id} className="space-y-2 p-5">
              <h2 className="font-medium">{item.nama}</h2>
              <p className="text-sm text-muted-foreground">
                {SASARAN_LABELS[item.sasaran] ?? "Lainnya"}
                {item.asalDana ? ` · ${ASAL_DANA_LABELS[item.asalDana] ?? "—"}` : " · —"}
              </p>
              {item.keterangan ? (
                <p className="text-sm text-muted-foreground">{item.keterangan}</p>
              ) : null}
            </ThemeCard>
          ))}
        </ul>
      )}
    </div>
  );
}
