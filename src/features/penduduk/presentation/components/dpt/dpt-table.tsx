import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type DptRow } from "@/features/penduduk/domain/dpt";
import { cn } from "@/lib/utils";

interface DptTableProps {
  rows: DptRow[];
  total: number; // unused but kept for potential future use
  page: number;
}

export function DptTable({ rows, total: _, page }: DptTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>Tidak ada data DPT untuk filter ini.</p>
        <p className="text-sm">
          Pastikan ada pemilihan aktif dan penduduk memenuhi syarat umur (≥17 tahun atau sudah
          kawin).
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">No</TableHead>
            <TableHead>NIK</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead className="w-32 text-center">Jenis Kelamin</TableHead>
            <TableHead className="w-32 text-center">Tgl Lahir</TableHead>
            <TableHead className="w-24 text-center">Umur</TableHead>
            <TableHead>Dusun</TableHead>
            <TableHead className="w-20 text-center">RW</TableHead>
            <TableHead className="w-20 text-center">RT</TableHead>
            <TableHead>Agama</TableHead>
            <TableHead>Pendidikan</TableHead>
            <TableHead>Pekerjaan</TableHead>
            <TableHead>Status Kawin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.id}
              className={cn("hover:bg-muted/50", index % 2 === 1 && "bg-muted/30")}
            >
              <TableCell className="text-center font-mono text-sm">
                {(page - 1) * 20 + index + 1}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {row.nationalId ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-center text-sm">
                {row.gender === "male" ? "Laki-laki" : "Perempuan"}
              </TableCell>
              <TableCell className="text-center text-sm">
                {row.birthDate ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-center text-sm font-medium">
                {row.umurPemilihan ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-sm">
                {row.dusun ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-center text-sm">
                {row.rw ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-center text-sm">
                {row.rt ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-sm">
                {row.agama ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-sm">
                {row.pendidikan ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-sm">
                {row.pekerjaan ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="text-sm">
                {row.statusKawin ?? <span className="text-muted-foreground">-</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
