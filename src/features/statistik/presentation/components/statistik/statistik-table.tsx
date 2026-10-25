"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Row {
  label: string;
  total: number;
  male: number;
  female: number;
  percentage: number;
}

interface Props {
  rows: Row[];
  summary: { total: number; male: number; female: number };
  title?: string;
}

export function StatistikTable({ rows, summary, title }: Props) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Laki-laki</TableHead>
            <TableHead className="text-right">Perempuan</TableHead>
            <TableHead className="text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{r.label}</TableCell>
              <TableCell className="text-right">{r.total.toLocaleString("id-ID")}</TableCell>
              <TableCell className="text-right">{r.male.toLocaleString("id-ID")}</TableCell>
              <TableCell className="text-right">{r.female.toLocaleString("id-ID")}</TableCell>
              <TableCell className="text-right">{r.percentage}%</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{summary.total.toLocaleString("id-ID")}</TableCell>
            <TableCell className="text-right">{summary.male.toLocaleString("id-ID")}</TableCell>
            <TableCell className="text-right">{summary.female.toLocaleString("id-ID")}</TableCell>
            <TableCell className="text-right">100%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
