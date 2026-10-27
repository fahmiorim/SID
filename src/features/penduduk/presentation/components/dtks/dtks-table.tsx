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
import { DTKS_STATUS_LABELS, type DtksListRow } from "@/features/penduduk/domain/dtks";
import { DtksRowActions } from "@/features/penduduk/presentation/components/dtks/dtks-row-actions";

export function DtksTable({
  data,
  canManage,
}: {
  data: DtksListRow[];
  page: number;
  pageCount: number;
  canManage: boolean;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RTM</TableHead>
            <TableHead>Kepala RTM</TableHead>
            <TableHead>Wilayah</TableHead>
            <TableHead>Versi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Anggota</TableHead>
            <TableHead>Update</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.rtmNumber}</TableCell>
              <TableCell>{row.rtmKepalaName}</TableCell>
              <TableCell className="text-muted-foreground">
                {[row.dusun, row.rw && `RW ${row.rw}`, row.rt && `RT ${row.rt}`]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </TableCell>
              <TableCell>{row.versiKuisioner}</TableCell>
              <TableCell>
                <Badge variant={row.status === "terverifikasi" ? "default" : "secondary"}>
                  {DTKS_STATUS_LABELS[row.status]}
                </Badge>
              </TableCell>
              <TableCell>{row.anggotaCount}</TableCell>
              <TableCell>{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                {canManage ? <DtksRowActions id={row.id} /> : "-"}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                Belum ada data DTKS.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
