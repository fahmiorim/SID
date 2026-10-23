import type { KelompokProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

const TIPE_LABELS: Record<string, string> = {
  kelompok: "Kelompok Masyarakat",
  lembaga: "Lembaga Desa",
};

/** Daftar kelompok masyarakat dan lembaga desa. */
export function EsensiKelompok({ ctx, kelompok }: KelompokProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Kelompok & Lembaga"
        description={`Daftar kelompok masyarakat dan lembaga yang aktif di ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      {kelompok.length === 0 ? (
        <ThemeEmpty>Belum ada kelompok atau lembaga yang tercatat.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {kelompok.map((item) => (
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
            </ThemeCard>
          ))}
        </ul>
      )}
    </div>
  );
}
