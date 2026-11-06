import { jabatanLabel } from "@/features/kelompok/domain/kelompok";
import type { KelompokProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader, ThemePrintButton } from "@/themes/ui";

const TIPE_LABELS: Record<string, string> = {
  kelompok: "Kelompok Masyarakat",
  lembaga: "Lembaga Desa",
};

/** Daftar kelompok masyarakat dan lembaga desa beserta anggota publiknya. */
export function EsensiKelompok({ ctx, kelompok }: KelompokProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <ThemePageHeader
          title="Kelompok & Lembaga"
          description={`Daftar kelompok masyarakat dan lembaga yang aktif di ${ctx.desa.namaDesa ?? "desa"}.`}
        />
        <ThemePrintButton label="Cetak daftar anggota" />
      </div>

      {kelompok.length === 0 ? (
        <ThemeEmpty>Belum ada kelompok atau lembaga yang tercatat.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {kelompok.map((item) => {
            const anggotaTampil = item.anggota.slice(0, 5);
            return (
              <ThemeCard as="li" key={item.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{item.nama}</h2>
                  <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {TIPE_LABELS[item.tipe] ?? item.tipe}
                  </span>
                </div>

                <dl className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Kategori</dt>
                    <dd>{item.kategori ?? "-"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Ketua</dt>
                    <dd>{item.ketua ?? "-"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Anggota</dt>
                    <dd>{item.jumlahAnggota.toLocaleString("id-ID")} orang</dd>
                  </div>
                  {item.kode ? (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-muted-foreground">Kode</dt>
                      <dd>{item.kode}</dd>
                    </div>
                  ) : null}
                </dl>

                {item.keterangan ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.keterangan}</p>
                ) : null}

                {item.anggota.length > 0 ? (
                  <details className="group border-t pt-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Daftar anggota ({item.anggota.length})
                    </summary>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {anggotaTampil.map((anggota) => (
                        <li key={anggota.id} className="flex flex-wrap justify-between gap-2">
                          <span>
                            {anggota.nama}
                            {anggota.nomorAnggota ? (
                              <span className="text-muted-foreground">
                                {" "}
                                · {anggota.nomorAnggota}
                              </span>
                            ) : null}
                          </span>
                          <span className="text-muted-foreground">
                            {jabatanLabel(anggota.jabatan)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {item.anggota.length > anggotaTampil.length ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        +{item.anggota.length - anggotaTampil.length} anggota lain. Gunakan tombol
                        cetak untuk daftar lengkap.
                      </p>
                    ) : null}
                  </details>
                ) : (
                  <p className="border-t pt-3 text-xs text-muted-foreground">
                    Tidak ada anggota yang dipublikasikan.
                  </p>
                )}
              </ThemeCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
