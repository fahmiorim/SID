"use client";

import { Calendar, Plus } from "lucide-react";
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
import type { KehadiranDTO } from "@/features/kehadiran/domain/kehadiran";

import { KehadiranFormDialog } from "./kehadiran-form-dialog";

interface KehadiranTableProps {
  items: KehadiranDTO[];
}

export function KehadiranTable({ items }: KehadiranTableProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<KehadiranDTO | null>(null);
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Hadir Perangkat Desa</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kehadiran
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative max-w-xs">
            <Calendar className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter Bulan (1-12)"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="pl-8"
            />
          </div>
          <Input
            placeholder="Filter Tahun"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-[120px]"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Perangkat</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Jam Masuk</TableHead>
              <TableHead>Jam Keluar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada data kehadiran.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.perangkatNama ?? "-"}</TableCell>
                  <TableCell>{item.perangkatJabatan ?? "-"}</TableCell>
                  <TableCell>{item.jamMasuk ?? "-"}</TableCell>
                  <TableCell>{item.jamKeluar ?? "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === "hadir"
                          ? "bg-green-100 text-green-800"
                          : item.status === "izin"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "sakit"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
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
      <KehadiranFormDialog open={open} onOpenChange={setOpen} item={selected} />
    </Card>
  );
}
