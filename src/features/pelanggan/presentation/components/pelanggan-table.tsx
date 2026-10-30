"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
import type { PelangganDTO } from "@/features/pelanggan/domain/pelanggan";
import { createIdleActionState } from "@/lib/action-state";

import { deletePelangganAction } from "../pelanggan-actions";
import { PelangganFormDialog } from "./pelanggan-form-dialog";

interface PelangganTableProps {
  items: PelangganDTO[];
}

export function PelangganTable({ items: initialItems }: PelangganTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PelangganDTO | null>(null);
  const [deleteState] = useActionState(
    deletePelangganAction,
    createIdleActionState<{ id: number } | null>(),
  );

  useEffect(() => {
    if (deleteState.status === "success") {
      toast.success(deleteState.message);
    }
  }, [deleteState]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Pelanggan</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada data pelanggan.
                </TableCell>
              </TableRow>
            ) : (
              initialItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.kontak ?? "-"}</TableCell>
                  <TableCell>{item.alamat ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.keterangan ?? "-"}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <PelangganFormDialog open={open} onOpenChange={setOpen} item={selected} />
    </Card>
  );
}
