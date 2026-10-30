import { HardHat } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getPembangunanPublik } from "@/features/pembangunan/application/use-cases";
import { formatAnggaran, statusPembangunanLabel } from "@/features/pembangunan/domain/pembangunan";
import { formatTanggal } from "@/features/publik/domain/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembangunan Desa",
  description: "Rencana, realisasi, dan hasil proyek pembangunan desa.",
};

function ProgresBar({ nilai }: { nilai: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.min(100, Math.max(0, nilai))}%` }}
      />
    </div>
  );
}

export default async function PembangunanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const params = await searchParams;
  const tahunParam = Number(params.tahun ?? "");
  const tahun = Number.isInteger(tahunParam) && tahunParam > 0 ? tahunParam : null;

  const { rows, ringkasan, tahunList } = await getPembangunanPublik(tahun);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Pembangunan Desa</h1>
        <p className="text-sm text-muted-foreground">
          Rencana, realisasi, dan hasil proyek pembangunan desa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total proyek</p>
          <p className="text-2xl font-semibold tabular-nums">{ringkasan.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Selesai / berjalan</p>
          <p className="text-2xl font-semibold tabular-nums">
            {ringkasan.selesai} / {ringkasan.berjalan}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total anggaran</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatAnggaran(ringkasan.totalAnggaran)}
          </p>
        </div>
      </div>

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
        <div className="flex flex-col items-center gap-2 rounded-lg border py-12 text-center text-muted-foreground">
          <HardHat className="size-6" />
          <p className="text-sm">
            {tahun !== null
              ? "Belum ada proyek pembangunan pada tahun ini."
              : "Belum ada data proyek pembangunan."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-lg border p-5">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
