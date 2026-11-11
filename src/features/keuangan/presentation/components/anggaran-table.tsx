"use client";

import { Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { AdminTableFrame } from "@/components/layout/admin-list";
import { MobileOnly } from "@/components/shared/mobile-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatRupiah,
  isInputRow,
  kodeDepth,
  type KeuanganBarisDTO,
} from "@/features/keuangan/domain/keuangan";
import { saveKeuanganAction } from "@/features/keuangan/presentation/actions";
import { idleActionState } from "@/lib/action-state";

interface Draft {
  anggaran: string;
  realisasi: string;
}

function toNumber(value: string): number {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function AnggaranTable({
  tahun,
  rows,
  canManage,
}: {
  tahun: number;
  rows: KeuanganBarisDTO[];
  canManage: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveKeuanganAction, idleActionState);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const inputRows = useMemo(() => rows.filter((row) => isInputRow(row.templateUuid)), [rows]);

  // Nilai efektif: draf lokal bila ada, jika tidak pakai nilai tersimpan.
  const anggaranOf = (row: KeuanganBarisDTO): string =>
    drafts[row.templateUuid]?.anggaran ?? row.anggaran;

  const realisasiOf = (row: KeuanganBarisDTO): string =>
    drafts[row.templateUuid]?.realisasi ?? row.realisasi;

  const dirtyRows = useMemo(
    () =>
      Object.entries(drafts)
        .filter(([uuid, draft]) => {
          const base = rows.find((row) => row.templateUuid === uuid);
          if (!base) return false;
          return (
            toNumber(draft.anggaran) !== toNumber(base.anggaran) ||
            toNumber(draft.realisasi) !== toNumber(base.realisasi)
          );
        })
        .map(([uuid, draft]) => ({
          templateUuid: uuid,
          anggaran: toNumber(draft.anggaran),
          realisasi: toNumber(draft.realisasi),
        })),
    [drafts, rows],
  );

  const payload = JSON.stringify(dirtyRows);

  function setDraft(uuid: string, patch: Partial<Draft>) {
    setDrafts((prev) => {
      const base = rows.find((row) => row.templateUuid === uuid);
      const current = prev[uuid] ?? {
        anggaran: base?.anggaran ?? "0",
        realisasi: base?.realisasi ?? "0",
      };
      return { ...prev, [uuid]: { ...current, ...patch } };
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tahun" value={tahun} />
      <input type="hidden" name="rows" value={payload} />

      <MobileOnly>
        <div className="space-y-2">
          {rows.map((row) => {
            const isLeaf = isInputRow(row.templateUuid);
            const anggaran = isLeaf ? anggaranOf(row) : row.anggaran;
            const realisasi = isLeaf ? realisasiOf(row) : row.realisasi;
            const persen =
              toNumber(anggaran) > 0 ? (toNumber(realisasi) / toNumber(anggaran)) * 100 : 0;

            return (
              <article
                key={row.templateUuid}
                className={`rounded-xl border p-3 ${
                  isLeaf
                    ? "border-[var(--brand)]/15 bg-[var(--brand-soft)]/40"
                    : "border-black/[0.06] bg-[var(--warm-paper)]/70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {row.templateUuid}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {persen.toFixed(2)}%
                  </span>
                </div>
                <p className={`mt-1 text-sm leading-snug ${isLeaf ? "" : "font-semibold"}`}>
                  {row.uraian}
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                      Anggaran
                    </dt>
                    <dd className="mt-1">
                      {canManage && isLeaf ? (
                        <Input
                          className="h-8 text-right text-xs tabular-nums"
                          inputMode="numeric"
                          aria-label={`Anggaran ${row.uraian}`}
                          value={anggaran}
                          onChange={(event) =>
                            setDraft(row.templateUuid, { anggaran: event.target.value })
                          }
                        />
                      ) : (
                        <span className="text-xs tabular-nums">{formatRupiah(anggaran)}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                      Realisasi
                    </dt>
                    <dd className="mt-1">
                      {canManage && isLeaf ? (
                        <Input
                          className="h-8 text-right text-xs tabular-nums"
                          inputMode="numeric"
                          aria-label={`Realisasi ${row.uraian}`}
                          value={realisasi}
                          onChange={(event) =>
                            setDraft(row.templateUuid, { realisasi: event.target.value })
                          }
                        />
                      ) : (
                        <span className="text-xs tabular-nums">{formatRupiah(realisasi)}</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </MobileOnly>

      <div className="hidden md:block print:block">
        <AdminTableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Kode</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead className="w-44 text-right">Anggaran</TableHead>
                <TableHead className="w-44 text-right">Realisasi</TableHead>
                <TableHead className="w-28 text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isLeaf = isInputRow(row.templateUuid);
                const anggaran = isLeaf ? anggaranOf(row) : row.anggaran;
                const realisasi = isLeaf ? realisasiOf(row) : row.realisasi;
                const persen =
                  toNumber(anggaran) > 0 ? (toNumber(realisasi) / toNumber(anggaran)) * 100 : 0;

                return (
                  <TableRow
                    key={row.templateUuid}
                    className={
                      isLeaf
                        ? "bg-[var(--brand-soft)]/45 hover:bg-[var(--brand-soft)]/70"
                        : "bg-[var(--warm-paper)]/60 hover:bg-[var(--warm-paper)]"
                    }
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.templateUuid}
                    </TableCell>
                    <TableCell
                      className={isLeaf ? "" : "font-medium"}
                      style={{ paddingLeft: `${(kodeDepth(row.templateUuid) - 1) * 16 + 12}px` }}
                    >
                      {row.uraian}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && isLeaf ? (
                        <>
                          <Input
                            className="h-8 text-right tabular-nums print:hidden"
                            inputMode="numeric"
                            value={anggaran}
                            onChange={(event) =>
                              setDraft(row.templateUuid, { anggaran: event.target.value })
                            }
                          />
                          {/* Cetak: tampilkan nilai sebagai teks, bukan kolom input. */}
                          <span className="hidden tabular-nums print:inline">
                            {formatRupiah(anggaran)}
                          </span>
                        </>
                      ) : (
                        <span className="tabular-nums">{formatRupiah(anggaran)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && isLeaf ? (
                        <>
                          <Input
                            className="h-8 text-right tabular-nums print:hidden"
                            inputMode="numeric"
                            value={realisasi}
                            onChange={(event) =>
                              setDraft(row.templateUuid, { realisasi: event.target.value })
                            }
                          />
                          <span className="hidden tabular-nums print:inline">
                            {formatRupiah(realisasi)}
                          </span>
                        </>
                      ) : (
                        <span className="tabular-nums">{formatRupiah(realisasi)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {persen.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AdminTableFrame>
      </div>

      {canManage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.05] pt-4">
          <p className="text-sm text-muted-foreground">
            {dirtyRows.length > 0 ? `${dirtyRows.length} baris berubah` : "Belum ada perubahan"}
          </p>
          <Button
            type="submit"
            disabled={pending || dirtyRows.length === 0}
            className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-strong)]"
          >
            <Save className="size-4" />
            {pending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      ) : null}

      {state.status === "error" ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p className="rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand)]">
          {state.message}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Total baris rekening: {rows.length.toLocaleString("id-ID")} · baris dapat diisi:{" "}
        {inputRows.length.toLocaleString("id-ID")}
      </p>
    </form>
  );
}
