"use client";

import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LapakDTO } from "@/features/lapak/domain/lapak";

import { LapakFormDialog } from "./lapak-form-dialog";

interface LapakTableProps {
  items: LapakDTO[];
  kategoriList: string[];
}

export function LapakTable({ items, kategoriList }: LapakTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LapakDTO | null>(null);
  const [filterKategori, setFilterKategori] = useState("");
  const [search, setSearch] = useState("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Lapak UMKM</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Lapak
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, pemilik, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterKategori} onValueChange={setFilterKategori}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Kategori</SelectItem>
              {kategoriList.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada data lapak.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.pemilik ?? "-"}</TableCell>
                  <TableCell>{item.kategori ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.alamat ?? "-"}</TableCell>
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
      <LapakFormDialog
        open={open}
        onOpenChange={setOpen}
        item={selected}
        kategoriList={kategoriList}
      />
    </Card>
  );
}
