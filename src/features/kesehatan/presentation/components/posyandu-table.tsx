"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  deletePosyanduAction,
  savePosyanduAction,
} from "@/features/kesehatan/presentation/actions-posyandu";

export interface PosyanduRow {
  id: number;
  nama: string;
  alamat?: string | null;
  namaKetua?: string | null;
  namaBidan?: string | null;
}

function PosyanduDialog({ row, trigger }: { row?: PosyanduRow; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row ? "Ubah Posyandu" : "Tambah Posyandu"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await savePosyanduAction(formData);
            if (res.ok) setOpen(false);
            else setError(res.message ?? "Gagal menyimpan.");
          }}
          className="space-y-3"
        >
          {row && <input type="hidden" name="id" value={row.id} />}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama</label>
            <Input name="nama" required defaultValue={row?.nama ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alamat</label>
            <Input name="alamat" defaultValue={row?.alamat ?? ""} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ketua</label>
              <Input name="namaKetua" defaultValue={row?.namaKetua ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bidan</label>
              <Input name="namaBidan" defaultValue={row?.namaBidan ?? ""} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PosyanduTable({ rows, canManage }: { rows: PosyanduRow[]; canManage: boolean }) {
  return (
    <div className="space-y-4">
      {canManage && <PosyanduDialog trigger={<Button>Tambah Posyandu</Button>} />}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Alamat</th>
                <th className="p-2 text-left">Ketua</th>
                <th className="p-2 text-left">Bidan</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2">{row.alamat ?? "-"}</td>
                  <td className="p-2">{row.namaKetua ?? "-"}</td>
                  <td className="p-2">{row.namaBidan ?? "-"}</td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <PosyanduDialog
                          row={row}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Ubah
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm(`Hapus posyandu "${row.nama}"?`)) return;
                            const res = await deletePosyanduAction(row.id);
                            if (!res.ok) alert(res.message);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={canManage ? 5 : 4}>
                    Belum ada data posyandu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
