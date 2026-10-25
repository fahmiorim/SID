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
import { type DtksListRow } from "@/features/penduduk/domain/dtks";

export function DtksTable({ data }: { data: DtksListRow[]; page: number; pageCount: number }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RTM</TableHead>
            <TableHead>Kepala RTM</TableHead>
            <TableHead>Versi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Anggota</TableHead>
            <TableHead>Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.rtmNumber}</TableCell>
              <TableCell>{row.rtmKepalaName}</TableCell>
              <TableCell>{row.versiKuisioner}</TableCell>
              <TableCell>
                <Badge variant={row.status === "terverifikasi" ? "default" : "secondary"}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>{row.anggotaCount}</TableCell>
              <TableCell>{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
