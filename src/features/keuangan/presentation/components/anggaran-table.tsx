"use client";

import { Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

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

      <div className="overflow-x-auto rounded-lg border">
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
                  className={isLeaf ? "bg-primary/5" : "bg-muted/30"}
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
                      <Input
                        className="h-8 text-right tabular-nums"
                        inputMode="numeric"
                        value={anggaran}
                        onChange={(event) =>
                          setDraft(row.templateUuid, { anggaran: event.target.value })
                        }
                      />
                    ) : (
                      <span className="tabular-nums">{formatRupiah(anggaran)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && isLeaf ? (
                      <Input
                        className="h-8 text-right tabular-nums"
                        inputMode="numeric"
                        value={realisasi}
                        onChange={(event) =>
                          setDraft(row.templateUuid, { realisasi: event.target.value })
                        }
                      />
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
      </div>

      {canManage ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {dirtyRows.length > 0 ? `${dirtyRows.length} baris berubah` : "Belum ada perubahan"}
          </p>
          <Button type="submit" disabled={pending || dirtyRows.length === 0}>
            <Save className="size-4" />
            {pending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-600">{state.message}</p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Total baris rekening: {rows.length} · baris dapat diisi: {inputRows.length}
      </p>
    </form>
  );
}
