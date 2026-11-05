import Link from "next/link";

import type { RekapSoalPublik } from "@/features/publik/domain/rekap-survei";
import type { SurveiProps } from "@/themes/types";
import { ThemeButton, ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

const TIPE_LABELS: Record<string, string> = {
  text: "Isian",
  number: "Angka",
  choice: "Pilihan",
};

const gayaTerpilih = {
  backgroundColor: "var(--pub-primary)",
  color: "var(--pub-primary-foreground)",
};

function formatAngka(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

/** Rekap satu soal; hanya agregat, tanpa isian teks responden. */
function SoalRekap({ soal }: { soal: RekapSoalPublik }) {
  if (soal.tipe === "choice") {
    return (
      <ul className="space-y-2">
        {soal.distribusi.map((item) => (
          <li key={item.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {item.jumlah.toLocaleString("id-ID")} ({item.persentase.toLocaleString("id-ID")}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, item.persentase))}%`,
                  backgroundColor: "var(--pub-primary)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (soal.tipe === "number") {
    if (soal.rataRata === null) {
      return <p className="text-sm text-muted-foreground">Belum ada jawaban angka.</p>;
    }

    return (
      <p className="text-sm text-muted-foreground">
        Rata-rata <span className="font-medium text-foreground">{formatAngka(soal.rataRata)}</span>
        {soal.terkecil !== null && soal.terbesar !== null ? (
          <>
            {" "}
            · Terkecil {formatAngka(soal.terkecil)} · Terbesar {formatAngka(soal.terbesar)}
          </>
        ) : null}{" "}
        · {soal.dijawab.toLocaleString("id-ID")} jawaban
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {soal.dijawab.toLocaleString("id-ID")} jawaban terkumpul. Isi jawaban tidak ditampilkan demi
      privasi responden.
    </p>
  );
}

/** Survei aktif, hasil pendataan agregat, dan filter periode respons. */
export function EsensiSurvei({ ctx, survei, periode, tersedia }: SurveiProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Analisis & Survei"
        description={`Survei dan hasil pendataan yang dihimpun oleh ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      {tersedia.length > 0 ? (
        <nav className="flex flex-wrap items-center gap-2" aria-label="Filter periode hasil survei">
          <span className="text-sm text-muted-foreground">Periode:</span>
          <Link
            href="/desa/analisis-survei"
            className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent"
            style={periode === null ? gayaTerpilih : undefined}
          >
            Semua
          </Link>
          {tersedia.map((tahun) => (
            <Link
              key={tahun}
              href={`/desa/analisis-survei?periode=${tahun}`}
              className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent"
              style={periode === tahun ? gayaTerpilih : undefined}
            >
              {tahun}
            </Link>
          ))}
        </nav>
      ) : null}

      {survei.length === 0 ? (
        <ThemeEmpty>Belum ada survei aktif saat ini.</ThemeEmpty>
      ) : (
        <ul className="space-y-4">
          {survei.map((item) => (
            <ThemeCard as="li" key={item.id} className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-semibold">{item.judul}</h2>
                  {item.deskripsi ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.deskripsi}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border px-2.5 py-0.5">
                    {item.jumlahSoal.toLocaleString("id-ID")} pertanyaan
                  </span>
                  <span className="rounded-full border px-2.5 py-0.5">
                    {item.jumlahResponden.toLocaleString("id-ID")} responden
                  </span>
                  {item.mulai || item.selesai ? (
                    <span className="rounded-full border px-2.5 py-0.5">
                      {item.mulai ?? "…"} s.d. {item.selesai ?? "…"}
                    </span>
                  ) : null}
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Pertanyaan</h3>
                {item.soal.length > 0 ? (
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {item.soal.map((soal) => (
                      <li key={soal.id}>
                        {soal.pertanyaan}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({TIPE_LABELS[soal.tipe] ?? soal.tipe})
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">Pertanyaan survei belum diisi.</p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Hasil Pendataan</h3>
                {item.jumlahResponden === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada respons{periode === null ? "" : ` pada periode ${periode}`}.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Disajikan sebagai agregat: tanpa nama, NIK, atau isi jawaban teks responden.
                    </p>
                    <ul className="space-y-4">
                      {item.soal.map((soal) => (
                        <li key={soal.id} className="space-y-2">
                          <p className="text-sm font-medium">{soal.pertanyaan}</p>
                          <SoalRekap soal={soal} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              <div>
                {item.bisaDiisi ? (
                  <ThemeButton href={`/desa/analisis-survei/${item.id}/isi`}>
                    Isi Survei
                  </ThemeButton>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pengisian survei ini sudah ditutup.
                  </p>
                )}
              </div>
            </ThemeCard>
          ))}
        </ul>
      )}
    </div>
  );
}
