import { FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { daftarDokumen } from "@/features/konten/application/dokumen-use-cases";

export default async function DokumenPage() {
  const dokumen = await daftarDokumen();

  return (
    <div className="space-y-6">
      <PageHeader title="Dokumen Publik" description="Dokumen yang tampil di situs publik desa." />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nomor</TableHead>
                <TableHead>Berkas/Tautan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dokumen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="size-5" />
                      <p>Belum ada dokumen publik.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                dokumen.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.kategori}</TableCell>
                    <TableCell>{item.tahun ?? "-"}</TableCell>
                    <TableCell>{item.jenis ?? "-"}</TableCell>
                    <TableCell>{item.nomor ?? "-"}</TableCell>
                    <TableCell>{item.berkas ?? item.tautan ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
