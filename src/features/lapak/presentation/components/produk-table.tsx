"use client";

import { Plus } from "lucide-react";
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
import type { LapakProdukDTO } from "@/features/lapak/domain/lapak-produk";

import { ProdukFormDialog } from "./produk-form-dialog";

interface ProdukTableProps {
  items: LapakProdukDTO[];
  lapakId: number;
}

export function ProdukTable({ items, lapakId }: ProdukTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LapakProdukDTO | null>(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => item.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Produk</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada data produk.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>Rp {Number(item.harga).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{item.stok ?? 0}</TableCell>
                  <TableCell>
                    {item.aktif ? (
                      <span className="text-green-600">Aktif</span>
                    ) : (
                      <span className="text-red-600">Nonaktif</span>
                    )}
                  </TableCell>
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
      <ProdukFormDialog open={open} onOpenChange={setOpen} lapakId={lapakId} item={selected} />
    </Card>
  );
}
