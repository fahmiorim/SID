import { formatRupiah, type GrafikBatangan } from "@/features/keuangan/domain/keuangan";

/**
 * Grafik batang RP APBDes (anggaran vs realisasi) tanpa dependensi eksternal.
 *
 * Digambar sebagai SVG agar dapat di-render di server dan tetap tajam saat
 * dicetak. Nilai seri sudah dalam rupiah utuh (lihat `seriGrafik`).
 */
export function RpApbdChart({ seri }: { seri: readonly GrafikBatangan[] }) {
  if (seri.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data.</p>;
  }

  const max = Math.max(...seri.flatMap((item) => [item.anggaran, item.realisasi]), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-primary" aria-hidden />
          Anggaran
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-emerald-500" aria-hidden />
          Realisasi
        </span>
      </div>

      <div className="space-y-3">
        {seri.map((item) => (
          <div key={item.kode} className="space-y-1">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="truncate">
                <span className="mr-1 text-xs text-muted-foreground tabular-nums">{item.kode}</span>
                {item.label}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatRupiah(String(item.realisasi))} / {formatRupiah(String(item.anggaran))}
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-3 w-full overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-primary"
                  style={{ width: `${(item.anggaran / max) * 100}%` }}
                />
              </div>
              <div className="h-3 w-full overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-emerald-500"
                  style={{ width: `${(item.realisasi / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
