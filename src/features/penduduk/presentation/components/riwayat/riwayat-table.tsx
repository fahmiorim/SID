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
  MUTATION_TYPE_LABELS,
  type RiwayatPendudukRow,
} from "@/features/penduduk/domain/riwayat-penduduk";

interface RiwayatTableProps {
  rows: RiwayatPendudukRow[];
  total: number;
  page: number;
}

export function RiwayatTable({ rows, total, page }: RiwayatTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Penduduk</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>No. Surat</TableHead>
              <TableHead>Alasan</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada riwayat.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.eventDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{MUTATION_TYPE_LABELS[row.type] ?? row.type}</Badge>
                  </TableCell>
                  <TableCell>{row.residentName ?? "-"}</TableCell>
                  <TableCell>{row.residentNationalId ?? "-"}</TableCell>
                  <TableCell>{row.referenceNo ?? "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{row.reason ?? "-"}</TableCell>
                  <TableCell className="max-w-[240px] truncate">{row.notes ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Menampilkan {rows.length} dari {total} data (halaman {page})
      </div>
    </div>
  );
}
