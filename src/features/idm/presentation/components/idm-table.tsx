"use client";

import { Loader2, Plus } from "lucide-react";
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
import { dimensiDariKode, IDM_DIMENSI, type IdmIndikatorDTO } from "@/features/idm/domain/idm";

import { hapusIdmAction } from "../idm-actions";
import { IdmFormDialog } from "./idm-form-dialog";

interface IdmTableProps {
  items: IdmIndikatorDTO[];
  tahun: number;
  canManage: boolean;
}

const LABEL_DIMENSI = new Map(IDM_DIMENSI.map((dimensi) => [dimensi.id, dimensi.kode]));

export function IdmTable({ items, tahun, canManage }: IdmTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IdmIndikatorDTO | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  function hapus(item: IdmIndikatorDTO) {
    setPendingId(item.id);
    startTransition(async () => {
      const state = await hapusIdmAction(item.id);
      if (state.status === "idle") return;
      if (state.status === "error") toast.error(state.message);
      else toast.success(state.message);
      setPendingId(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Indikator IDM Tahun {tahun}</CardTitle>
        {canManage ? (
          <Button
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Indikator
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Indikator</TableHead>
              <TableHead>Dimensi</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada data indikator IDM.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const dimensi = dimensiDariKode(item.kode);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.kode}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{dimensi ? (LABEL_DIMENSI.get(dimensi) ?? "-") : "-"}</TableCell>
                    <TableCell>{item.skor ?? "-"}</TableCell>
                    <TableCell>{item.kategori ?? "-"}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(item);
                          setOpen(true);
                        }}
                      >
                        Ubah
                      </Button>
                      {canManage ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pendingId === item.id}
                          onClick={() => hapus(item)}
                        >
                          {pendingId === item.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : null}
                          Hapus
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <IdmFormDialog open={open} onOpenChange={setOpen} item={selected} tahun={tahun} />
    </Card>
  );
}
