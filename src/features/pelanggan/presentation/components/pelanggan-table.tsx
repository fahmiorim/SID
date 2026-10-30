"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PelangganDTO } from "@/features/pelanggan/domain/pelanggan";

import { PelangganFormDialog } from "./pelanggan-form-dialog";

interface PelangganTableProps {
  items: PelangganDTO[];
}

export function PelangganTable({ items }: PelangganTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PelangganDTO | null>(null);
  const [search, setSearch] = useState("");

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
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, kontak, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada data pelanggan.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.kontak ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.alamat ?? "-"}</TableCell>
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
