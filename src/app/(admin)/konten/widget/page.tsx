"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { daftarWidgetAction } from "@/features/konten/presentation/widget-actions";

interface WidgetItem {
  id: number;
  judul: string | null;
  isi: string | null;
  jenis: string;
  aktif: boolean;
}

export default function WidgetPage() {
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);

  useEffect(() => {
    async function loadWidgets() {
      const result = await daftarWidgetAction(null, new FormData());
      if (Array.isArray(result)) {
        setWidgets(result);
      }
    }
    loadWidgets();
  }, []);

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="mx-auto max-w-7xl">
      <CardContent>
        <PageHeader title="Kelola Widget" />

        <div className="mb-6">
          <Button variant="secondary" onClick={() => {}}>
            Tambah Widget
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="id" defaultValue="" />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Judul</label>
              <Input name="judul" placeholder="Judul widget" defaultValue="" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Isi</label>
              <Input name="isi" placeholder="Isi widget" defaultValue="" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Jenis</label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Teks</SelectItem>
                  <SelectItem value="2">Galeri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Aktif</label>
              <Checkbox defaultChecked />
            </div>
          </div>

          <Button type="submit" variant="secondary">
            Simpan
          </Button>
        </form>

        <div className="mt-8">
          <h3 className="mb-4 font-medium">Daftar Widget</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">#</TableCell>
                <TableCell className="font-medium">Judul</TableCell>
                <TableCell className="font-medium">Jenis</TableCell>
                <TableCell className="font-medium">Aktif</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widgets.map((w: WidgetItem) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.judul}</TableCell>
                  <TableCell>{w.jenis}</TableCell>
                  <TableCell>
                    {w.aktif ? (
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
