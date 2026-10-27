"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SASARAN_LABELS,
  type SuplemenListRow,
  type SuplemenOption,
} from "@/features/penduduk/domain/suplemen";
import { SuplemenActions } from "@/features/penduduk/presentation/components/suplemen/suplemen-actions";
import { SuplemenTerdataDialog } from "@/features/penduduk/presentation/components/suplemen/suplemen-terdata-dialog";

export function SuplemenTable({
  data,
  pendudukOptions,
  keluargaOptions,
  canManage,
}: {
  data: SuplemenListRow[];
  page: number;
  pageCount: number;
  pendudukOptions: SuplemenOption[];
  keluargaOptions: SuplemenOption[];
  canManage: boolean;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Suplemen</TableHead>
            <TableHead>Sasaran</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead>Jumlah Terdata</TableHead>
            <TableHead>Update</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.nama}</TableCell>
              <TableCell>
                <Badge variant="secondary">{SASARAN_LABELS[row.sasaran] ?? "Penduduk"}</Badge>
              </TableCell>
              <TableCell>{row.keterangan ?? "-"}</TableCell>
              <TableCell>
                <SuplemenTerdataDialog
                  suplemen={row}
                  pendudukOptions={pendudukOptions}
                  keluargaOptions={keluargaOptions}
                />
              </TableCell>
              <TableCell>{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>{canManage ? <SuplemenActions suplemen={row} /> : "-"}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                Belum ada data suplemen.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
