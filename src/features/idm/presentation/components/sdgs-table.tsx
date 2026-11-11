"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSkor, normalisasiSkor, SDGS_GOALS, type SdgsDTO } from "@/features/idm/domain/idm";

import { hapusSdgsAction } from "../idm-actions";
import { SdgsFormDialog } from "./sdgs-form-dialog";

interface SdgsTableProps {
  rows: SdgsDTO[];
  tahun: number;
  canManage: boolean;
}

/** Tabel 18 tujuan SDGs; tujuan yang belum diisi tetap tampil agar mudah dilengkapi. */
export function SdgsTable({ rows, tahun, canManage }: SdgsTableProps) {
  const [terpilih, setTerpilih] = useState<number | null>(null);
  const [pendingGoal, setPendingGoal] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const peta = new Map(rows.map((row) => [row.goal, row]));

  function hapus(goal: number) {
    setPendingGoal(goal);
    startTransition(async () => {
      const state = await hapusSdgsAction(tahun, goal);
      if (state.status === "idle") return;
      if (state.status === "error") toast.error(state.message);
      else toast.success(state.message);
      setPendingGoal(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capaian SDGs Desa Tahun {tahun}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead className={canManage ? undefined : "whitespace-normal"}>Tujuan</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead className={canManage ? undefined : "hidden md:table-cell"}>
                Keterangan
              </TableHead>
              <TableHead className={`text-right ${canManage ? "" : "hidden md:table-cell"}`}>
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SDGS_GOALS.map((goal) => {
              const row = peta.get(goal.nomor);
              return (
                <TableRow key={goal.nomor}>
                  <TableCell className="tabular-nums">{goal.nomor}</TableCell>
                  <TableCell className={canManage ? undefined : "whitespace-normal"}>
                    {goal.nama}
                  </TableCell>
                  <TableCell>{row ? formatSkor(normalisasiSkor(row.skor)) : "—"}</TableCell>
                  <TableCell
                    className={`max-w-64 truncate text-muted-foreground ${canManage ? "" : "hidden md:table-cell"}`}
                  >
                    {row?.keterangan ?? "Belum diisi"}
                  </TableCell>
                  <TableCell
                    className={`space-x-2 text-right ${canManage ? "" : "hidden md:table-cell"}`}
                  >
                    {canManage ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setTerpilih(goal.nomor)}>
                          {row ? "Ubah" : "Isi"}
                        </Button>
                        {row ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pendingGoal === goal.nomor}
                            onClick={() => hapus(goal.nomor)}
                          >
                            {pendingGoal === goal.nomor ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : null}
                            Hapus
                          </Button>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {terpilih !== null ? (
        <SdgsFormDialog
          open
          onOpenChange={(next) => setTerpilih(next ? terpilih : null)}
          tahun={tahun}
          goal={terpilih}
          item={peta.get(terpilih) ?? null}
        />
      ) : null}
    </Card>
  );
}
