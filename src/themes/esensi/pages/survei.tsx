import type { SurveiProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Survei aktif yang dikelola desa. */
export function EsensiSurvei({ ctx, survei }: SurveiProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Analisis & Survei"
        description={`Survei aktif dan pertanyaan yang sedang dihimpun oleh ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      {survei.length === 0 ? (
        <ThemeEmpty>Belum ada survei aktif saat ini.</ThemeEmpty>
      ) : (
        <ul className="space-y-4">
          {survei.map((item) => (
            <ThemeCard as="li" key={item.id} className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-semibold">{item.judul}</h2>
                  {item.deskripsi ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.deskripsi}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border px-2.5 py-0.5">
                    {item.jumlahSoal.toLocaleString("id-ID")} pertanyaan
                  </span>
                  <span className="rounded-full border px-2.5 py-0.5">
                    {item.jumlahResponden.toLocaleString("id-ID")} responden
                  </span>
                </div>
              </div>

              {item.soal.length > 0 ? (
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {item.soal.map((soal) => (
                    <li key={soal.id}>{soal.pertanyaan}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">Pertanyaan survei belum diisi.</p>
              )}
            </ThemeCard>
          ))}
        </ul>
      )}

      <p className="text-sm text-muted-foreground">
        Pengisian survei secara mandiri belum tersedia. Hasil agregat ditampilkan setelah data
        responden diolah oleh petugas desa.
      </p>
    </div>
  );
}
