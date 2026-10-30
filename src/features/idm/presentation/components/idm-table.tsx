"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

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
import type { IdmIndikatorDTO } from "@/features/idm/domain/idm";

import { IdmFormDialog } from "./idm-form-dialog";

interface IdmTableProps {
  items: IdmIndikatorDTO[];
  tahun: number;
}

export function IdmTable({ items, tahun }: IdmTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IdmIndikatorDTO | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Indikator IDM Tahun {tahun}</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Indikator
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Indikator</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada data indikator IDM.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.kode}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.skor}</TableCell>
                  <TableCell>{item.kategori ?? "-"}</TableCell>
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
      <IdmFormDialog open={open} onOpenChange={setOpen} item={selected} tahun={tahun} />
    </Card>
  );
}
