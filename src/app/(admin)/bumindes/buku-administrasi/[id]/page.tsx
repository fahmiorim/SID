import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBumindesDetail } from "@/features/bumindes/presentation/actions";

export const metadata: Metadata = { title: "Buku Administrasi" };

export default async function BukuAdministrasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bukuId = Number(id);

  if (!Number.isInteger(bukuId) || bukuId < 1) notFound();

  const detail = await getBumindesDetail(bukuId);
  if (!detail) notFound();

  const { buku, items } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={buku.namaBuku}
        description={`Kode buku ${buku.kodeBuku}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/bumindes/buku-administrasi">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">No. Urut</TableHead>
                <TableHead className="w-36">Tanggal</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Belum ada item pada buku ini.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="tabular-nums">{item.nomorUrut}</TableCell>
                    <TableCell>{item.tanggal ?? "-"}</TableCell>
                    <TableCell className="font-medium">{item.uraian}</TableCell>
                    <TableCell>{item.keterangan ?? "-"}</TableCell>
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
