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
import type { BukuTamuDTO } from "@/features/buku-tamu/domain/buku-tamu";

import { BukuTamuFormDialog } from "./buku-tamu-form-dialog";

interface BukuTamuTableProps {
  items: BukuTamuDTO[];
}

export function BukuTamuTable({ items }: BukuTamuTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BukuTamuDTO | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Buku Tamu Desa</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tamu
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Instansi</TableHead>
              <TableHead>Keperluan</TableHead>
              <TableHead>Jam Masuk</TableHead>
              <TableHead>Jam Keluar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada data buku tamu.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.instansi ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.keperluan ?? "-"}</TableCell>
                  <TableCell>{item.jamMasuk ?? "-"}</TableCell>
                  <TableCell>{item.jamKeluar ?? "-"}</TableCell>
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
      <BukuTamuFormDialog open={open} onOpenChange={setOpen} item={selected} />
    </Card>
  );
}
