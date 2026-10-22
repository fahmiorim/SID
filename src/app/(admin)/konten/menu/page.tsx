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
import { daftarMenu } from "@/features/konten/presentation/menu-actions";

interface MenuItem {
  id: number;
  nama: string;
  link: string;
  linkTipe: string;
  urut: number;
  aktif: boolean;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMenu() {
      const result = await daftarMenu("", new FormData());
      if (Array.isArray(result)) {
        setMenus(result);
      }
    }
    loadMenu();
  }, []);

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormMode("add");
  };

  return (
    <Card className="mx-auto max-w-7xl">
      <CardContent>
        <PageHeader title="Kelola Menu Navigasi" />

        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => setFormMode("add")}
            disabled={formMode === "add"}
          >
            Tambah Menu
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="id" defaultValue={formId?.toString() || ""} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Menu</label>
              <Input name="nama" placeholder="Nama menu" defaultValue="" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Link</label>
              <Input name="link" placeholder="/beranda" defaultValue="" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tipe Link</label>
              <Select defaultValue="internal">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Urutan</label>
              <Input type="number" name="urut" defaultValue="0" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Aktif</label>
            <Checkbox defaultChecked />
          </div>

          <Button type="submit" variant="secondary" disabled={formMode === "add"}>
            {formMode === "add" ? "Simpan" : "Perbarui"}
          </Button>
        </form>

        <div className="mt-8">
          <h3 className="mb-4 font-medium">Daftar Menu</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">#</TableCell>
                <TableCell className="font-medium">Nama</TableCell>
                <TableCell className="font-medium">Link</TableCell>
                <TableCell className="font-medium">Tipe</TableCell>
                <TableCell className="font-medium">Urutan</TableCell>
                <TableCell className="font-medium">Aktif</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu: MenuItem) => (
                <TableRow key={menu.id}>
                  <TableCell>{menu.id}</TableCell>
                  <TableCell>{menu.nama}</TableCell>
                  <TableCell>{menu.link}</TableCell>
                  <TableCell>{menu.linkTipe}</TableCell>
                  <TableCell>{menu.urut}</TableCell>
                  <TableCell>
                    {menu.aktif ? (
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
