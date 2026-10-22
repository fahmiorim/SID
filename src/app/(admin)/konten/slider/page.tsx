"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { daftarWidgetAction } from "@/features/konten/presentation/widget-actions";

interface SliderItem {
  id: number;
  gambar: string | null;
  judul: string | null;
  keterangan: string | null;
  aktif: boolean;
}

export default function SliderPage() {
  const [sliders, setSliders] = useState<SliderItem[]>([]);

  useEffect(() => {
    async function loadSliders() {
      // For now, use the widget action as placeholder
      const result = await daftarWidgetAction(null, new FormData());
      if (Array.isArray(result)) {
        setSliders(result as SliderItem[]);
      }
    }
    loadSliders();
  }, []);

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="mx-auto max-w-7xl">
      <CardContent>
        <PageHeader title="Kelola Slider Beranda" />

        <div className="mb-6">
          <Button variant="secondary" onClick={() => {}}>
            Tambah Slider
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="id" defaultValue="" />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Gambar</label>
              <Input name="gambar" placeholder="URL gambar" defaultValue="" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Judul</label>
              <Input name="judul" placeholder="Judul slider" defaultValue="" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Keterangan</label>
              <Input name="keterangan" placeholder="Keterangan slider" defaultValue="" />
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
          <h3 className="mb-4 font-medium">Daftar Slider</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">#</TableCell>
                <TableCell className="font-medium">Gambar</TableCell>
                <TableCell className="font-medium">Judul</TableCell>
                <TableCell className="font-medium">Keterangan</TableCell>
                <TableCell className="font-medium">Aktif</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sliders.map((s: SliderItem) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.gambar}</TableCell>
                  <TableCell>{s.judul}</TableCell>
                  <TableCell>{s.keterangan}</TableCell>
                  <TableCell>
                    {s.aktif ? (
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
