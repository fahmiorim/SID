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
import { formatPeriodeSinergi, type SinergiDTO } from "@/features/sinergi/domain/sinergi";

import { SinergiFormDialog } from "./sinergi-form-dialog";
import { SinergiRowActions } from "./sinergi-row-actions";

interface SinergiTableProps {
  rows: SinergiDTO[];
  canEdit: boolean;
  canDelete: boolean;
}

export function SinergiTable({ rows, canEdit, canDelete }: SinergiTableProps) {
  const [cari, setCari] = useState("");
  const [open, setOpen] = useState(false);
  const tahunAwal = new Date().getFullYear();

  const kataKunci = cari.trim().toLowerCase();
  const tampil = kataKunci
    ? rows.filter((row) =>
        [row.nama, row.mitra ?? "", row.keterangan ?? "", row.tahun ? String(row.tahun) : ""].some(
          (nilai) => nilai.toLowerCase().includes(kataKunci),
        ),
      )
    : rows;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Daftar Program Sinergi</CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              placeholder="Cari program atau mitra…"
              className="pl-8 sm:w-64"
              aria-label="Cari program sinergi"
            />
          </div>
          {canEdit ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Tambah program
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama program</TableHead>
              <TableHead>Mitra / pihak</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tampil.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {rows.length === 0
                    ? "Belum ada program sinergi yang dicatat."
                    : "Tidak ada program yang cocok dengan pencarian."}
                </TableCell>
              </TableRow>
            ) : (
              tampil.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell>{row.mitra ?? "-"}</TableCell>
                  <TableCell>{row.tahun ?? "-"}</TableCell>
                  <TableCell>{formatPeriodeSinergi(row)}</TableCell>
                  <TableCell className="max-w-64 truncate text-muted-foreground">
                    {row.keterangan ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <SinergiRowActions
                      item={row}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      tahunAwal={tahunAwal}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <SinergiFormDialog open={open} onOpenChange={setOpen} item={null} tahunAwal={tahunAwal} />
    </Card>
  );
}
