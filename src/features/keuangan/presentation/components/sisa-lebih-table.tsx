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
import type { SisaLebihDTO } from "@/features/keuangan/domain/sisa-lebih";

import { SisaLebihFormDialog } from "./sisa-lebih-form-dialog";

interface SisaLebihTableProps {
  items: SisaLebihDTO[];
}

export function SisaLebihTable({ items }: SisaLebihTableProps) {
  const [selected, setSelected] = useState<SisaLebihDTO | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sisa Lebih Pembiayaan (SiLPA)</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Data
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tahun</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada data SiLPA.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tahun}</TableCell>
                  <TableCell>{item.jumlah ?? "-"}</TableCell>
                  <TableCell>{item.tanggal ?? "-"}</TableCell>
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
      <SisaLebihFormDialog open={open} onOpenChange={setOpen} item={selected} />
    </Card>
  );
}
