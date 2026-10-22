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
import type { TriwulanBaris } from "@/features/keuangan/domain/laporan-triwulan";
import { saveKeuanganTriwulanAction } from "@/features/keuangan/presentation/actions";
import { idleActionState } from "@/lib/action-state";

const KUARTAL = ["tw1", "tw2", "tw3", "tw4"] as const;
type Kuartal = (typeof KUARTAL)[number];

type Draft = Record<Kuartal, string>;

function toNumber(value: string): number {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TriwulanInputTable({ tahun, rows }: { tahun: number; rows: TriwulanBaris[] }) {
  const [state, formAction, pending] = useActionState(saveKeuanganTriwulanAction, idleActionState);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const draftOf = (row: TriwulanBaris): Draft =>
    drafts[row.kode] ?? { tw1: row.tw1, tw2: row.tw2, tw3: row.tw3, tw4: row.tw4 };

  const dirtyRows = useMemo(() => {
    return Object.entries(drafts)
      .filter(([kode, draft]) => {
        const base = rows.find((row) => row.kode === kode);
        if (!base) return false;
        return KUARTAL.some((tw) => toNumber(draft[tw]) !== toNumber(base[tw]));
      })
      .map(([kode, draft]) => ({
        kode,
        tw1: toNumber(draft.tw1),
        tw2: toNumber(draft.tw2),
        tw3: toNumber(draft.tw3),
        tw4: toNumber(draft.tw4),
      }));
  }, [drafts, rows]);

  function setDraft(row: TriwulanBaris, patch: Partial<Draft>) {
    setDrafts((prev) => {
      const current = prev[row.kode] ?? {
        tw1: row.tw1,
        tw2: row.tw2,
        tw3: row.tw3,
        tw4: row.tw4,
      };
      return { ...prev, [row.kode]: { ...current, ...patch } };
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tahun" value={tahun} />
      <input type="hidden" name="rows" value={JSON.stringify(dirtyRows)} />

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Kode</TableHead>
              <TableHead>Bidang</TableHead>
              <TableHead className="w-40 text-right">TW I</TableHead>
              <TableHead className="w-40 text-right">TW II</TableHead>
              <TableHead className="w-40 text-right">TW III</TableHead>
              <TableHead className="w-40 text-right">TW IV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const draft = draftOf(row);
              return (
                <TableRow key={row.kode}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.kode}
                  </TableCell>
                  <TableCell className="font-medium">{row.uraian}</TableCell>
                  {KUARTAL.map((tw) => (
                    <TableCell key={tw} className="text-right">
                      <Input
                        aria-label={`${row.uraian} ${tw.toUpperCase()}`}
                        className="h-8 text-right tabular-nums"
                        inputMode="decimal"
                        value={draft[tw]}
                        onChange={(event) => setDraft(row, { [tw]: event.target.value })}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {dirtyRows.length > 0 ? `${dirtyRows.length} bidang berubah` : "Belum ada perubahan"}
        </p>
        <Button type="submit" disabled={pending || dirtyRows.length === 0}>
          <Save className="size-4" />
          {pending ? "Menyimpan…" : "Simpan Realisasi"}
        </Button>
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-600">{state.message}</p>
      ) : null}
    </form>
  );
}
