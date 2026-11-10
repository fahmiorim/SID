import { HardHat } from "lucide-react";
import Link from "next/link";

import { formatAnggaran, statusPembangunanLabel } from "@/features/pembangunan/domain/pembangunan";
import { formatTanggal } from "@/features/publik/domain/format";
import type { PembangunanProps } from "@/themes/types";
import { ThemeCard, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

function ProgresBar({ nilai }: { nilai: number }) {
  // Batang progres hanya penguat visual; persentase sudah dibacakan di sebelahnya.
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, nilai))}%`,
          backgroundColor: "var(--pub-primary)",
        }}
      />
    </div>
  );
}

/** Daftar proyek pembangunan desa dengan filter tahun anggaran. */
export function EsensiPembangunan({ tahun, data }: PembangunanProps) {
  const { rows, ringkasan, tahunList } = data;

  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Pembangunan Desa"
        description="Rencana, realisasi, dan hasil proyek pembangunan desa."
        eyebrow="Transparansi"
      />

      <ThemeStatGrid
        items={[
          { label: "Total proyek", nilai: ringkasan.total },
          { label: "Selesai", nilai: ringkasan.selesai },
          { label: "Berjalan", nilai: ringkasan.berjalan },
          { label: "Total anggaran", nilai: formatAnggaran(ringkasan.totalAnggaran) },
        ]}
      />

      {tahunList.length > 0 ? (
        <form method="get" className="flex flex-wrap items-center gap-2">
          <label htmlFor="tahun" className="text-sm text-muted-foreground">
            Tahun anggaran
          </label>
          <select
            id="tahun"
            name="tahun"
            defaultValue={tahun !== null ? String(tahun) : ""}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Semua tahun</option>
            {tahunList.map((item) => (
              <option key={item} value={String(item)}>
                {item}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
            Terapkan
          </button>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <HardHat className="size-6" aria-hidden="true" />
          <p className="text-sm">
            {tahun !== null
              ? "Belum ada proyek pembangunan pada tahun ini."
              : "Belum ada data proyek pembangunan."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id}>
              <ThemeCard className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Link
                      href={`/desa/pembangunan/${row.slug}`}
                      className="text-base font-semibold hover:underline"
                    >
                      {row.judul}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {row.tahunAnggaran} · {statusPembangunanLabel(row.status)}
                      {row.lokasi ? ` · ${row.lokasi}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{row.progres}%</span>
                </div>

                <div className="mt-3">
                  <ProgresBar nilai={row.progres} />
                </div>

                <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-3 sm:block">
                    <dt className="text-muted-foreground">Anggaran</dt>
                    <dd className="tabular-nums">{formatAnggaran(row.anggaran)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:block">
                    <dt className="text-muted-foreground">Pelaksana</dt>
                    <dd>{row.pelaksana ?? "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:block">
                    <dt className="text-muted-foreground">Sumber dana</dt>
                    <dd>{row.sumberDana ?? "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:block">
                    <dt className="text-muted-foreground">Periode</dt>
                    <dd>
                      {formatTanggal(row.mulai) || "…"} — {formatTanggal(row.selesai) || "…"}
                    </dd>
                  </div>
                </dl>
              </ThemeCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
