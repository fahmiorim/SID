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
import { SASARAN_LABELS, type SuplemenListRow } from "@/features/penduduk/domain/suplemen";

export function SuplemenTable({
  data,
}: {
  data: SuplemenListRow[];
  page: number;
  pageCount: number;
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
              <TableCell>{row.terdataCount}</TableCell>
              <TableCell>{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                Belum ada data suplemen.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
