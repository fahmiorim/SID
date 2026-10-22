"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { daftarDokumenAction } from "@/features/konten/presentation/dokumen-actions";

interface DokumenItem {
  id: number;
  nama: string;
  slug: string;
  kategori: string;
  tahun: number | null;
  berkas: string | null;
  tautan: string | null;
  keterangan: string | null;
  aktif: boolean;
}

export default function DokumenPage() {
  const [dokumen, setDokumen] = useState<DokumenItem[]>([]);

  useEffect(() => {
    async function loadDokumen() {
      const result = await daftarDokumenAction(null, new FormData());
      if (Array.isArray(result)) {
        setDokumen(result);
      }
    }
    loadDokumen();
  }, []);

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="mx-auto max-w-7xl">
      <CardContent>
        <PageHeader title="Kelola Dokumen Publik" />

        <div className="mb-6">
          <Button variant="secondary" onClick={() => {}}>
            Tambah Dokumen
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="id" defaultValue="" />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Nama</label>
              <Input name="nama" placeholder="Nama dokumen" defaultValue="" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Slug</label>
              <Input name="slug" placeholder="slug-dokumen" defaultValue="" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <Input name="kategori" placeholder="kategori" defaultValue="" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <Input type="number" name="tahun" placeholder="Contoh: 2024" defaultValue="" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Keterangan</label>
              <Input name="keterangan" placeholder="Keterangan" defaultValue="" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Tautan (opsional)</label>
              <Input name="tautan" placeholder="https://..." defaultValue="" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Berkas (URL)</label>
            <Input name="berkas" placeholder="URL berkas" defaultValue="" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Aktif</label>
            <Checkbox defaultChecked />
          </div>

          <Button type="submit" variant="secondary">
            Simpan
          </Button>
        </form>

        <div className="mt-8">
          <h3 className="mb-4 font-medium">Daftar Dokumen</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">#</TableCell>
                <TableCell className="font-medium">Nama</TableCell>
                <TableCell className="font-medium">Slug</TableCell>
                <TableCell className="font-medium">Kategori</TableCell>
                <TableCell className="font-medium">Tahun</TableCell>
                <TableCell className="font-medium">Aktif</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dokumen.map((d: DokumenItem) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.nama}</TableCell>
                  <TableCell>{d.slug}</TableCell>
                  <TableCell>{d.kategori}</TableCell>
                  <TableCell>{d.tahun}</TableCell>
                  <TableCell>
                    {d.aktif ? (
                      <Badge variant="secondary">Aktif</Badge>
                    ) : (
                      <Badge variant="outline">Nonaktif</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
