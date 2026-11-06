import Link from "next/link";

import { labelPeriodeSurvei } from "@/features/publik/domain/hasil-survei";
import type { SurveiProps } from "@/themes/types";
import { ThemeButton, ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Survei aktif yang dikelola desa beserta rekap agregatnya. */
export function EsensiSurvei({ ctx, survei, hasil, tahun, tahunTersedia }: SurveiProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Analisis & Survei"
        description={`Survei aktif dan hasil pendataan yang dihimpun oleh ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      {tahunTersedia.length > 0 ? (
        <form
          method="get"
          action="/desa/analisis-survei"
          className="flex flex-wrap items-end gap-3 border p-4"
          style={{ borderRadius: "var(--pub-radius)" }}
        >
          <div className="space-y-1">
            <label htmlFor="survei-tahun" className="text-sm font-medium">
              Periode hasil
            </label>
            <select
              id="survei-tahun"
              name="tahun"
              defaultValue={tahun === null ? "" : String(tahun)}
              className="min-h-10 border px-3 text-sm"
            >
              <option value="">Seluruh periode</option>
              {tahunTersedia.map((item) => (
                <option key={item} value={String(item)}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="tema-button-primary inline-flex min-h-10 items-center justify-center px-4 text-sm font-medium"
          >
            Tampilkan
          </button>
          {tahun !== null ? (
            <Link
              href="/desa/analisis-survei"
              className="tema-link-primary text-sm hover:underline"
            >
              Hapus filter
            </Link>
          ) : null}
        </form>
      ) : null}

      {survei.length === 0 ? (
        <ThemeEmpty>Belum ada survei aktif saat ini.</ThemeEmpty>
      ) : (
        <ul className="space-y-4">
          {survei.map((item) => {
            const rekap = hasil.find((entry) => entry.surveiId === item.id);
            return (
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
                {rekap && rekap.jumlahResponden > 0 ? (
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold">Hasil pendataan</h3>
                      <p className="text-xs text-muted-foreground">
                        {rekap.jumlahResponden.toLocaleString("id-ID")} responden ·{" "}
                        {labelPeriodeSurvei(tahun)}
                      </p>
                    </div>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {rekap.soal.map((soal) => (
                        <div key={soal.soalId} className="space-y-1">
                          <dt className="text-sm font-medium">{soal.pertanyaan}</dt>
                          <dd className="text-sm text-muted-foreground">
                            {soal.tipe === "choice" ? (
                              <ul className="space-y-1">
                                {soal.distribusi.map((baris) => (
                                  <li
                                    key={baris.label}
                                    className="flex items-center justify-between gap-3"
                                  >
                                    <span>{baris.label}</span>
                                    <span className="tabular-nums">
                                      {baris.jumlah.toLocaleString("id-ID")} (
                                      {baris.persen.toLocaleString("id-ID")}%)
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : soal.tipe === "number" ? (
                              <span>
                                Rata-rata{" "}
                                {(soal.rataRata ?? 0).toLocaleString("id-ID", {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                dari {soal.jumlahJawaban.toLocaleString("id-ID")} jawaban
                              </span>
                            ) : (
                              <span>
                                {soal.jumlahJawaban.toLocaleString("id-ID")} jawaban (isi tidak
                                dipublikasikan)
                              </span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                <div className="mt-4">
                  <ThemeButton href={`/desa/analisis-survei/${item.id}/isi`}>
                    Isi Survei
                  </ThemeButton>
                </div>
              </ThemeCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
