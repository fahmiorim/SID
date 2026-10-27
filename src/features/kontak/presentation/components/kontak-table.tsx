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
import { Textarea } from "@/components/ui/textarea";
import {
  deleteKontakAction,
  saveKontakAction,
} from "@/features/kontak/presentation/actions-kontak";

export interface KontakRow {
  id: number;
  nama: string;
  telepon: string | null;
  email: string | null;
  telegram: string | null;
  hubungWarga: string | null;
  keterangan: string | null;
}

function KontakFormDialog({ kontak, trigger }: { kontak?: KontakRow; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{kontak ? "Ubah Kontak" : "Tambah Kontak"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await saveKontakAction(formData);
            if (res.ok) setOpen(false);
            else setError(res.message ?? "Gagal menyimpan.");
          }}
          className="space-y-3"
        >
          {kontak && <input type="hidden" name="id" value={kontak.id} />}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama</label>
            <Input name="nama" required defaultValue={kontak?.nama ?? ""} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input name="telepon" defaultValue={kontak?.telepon ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" defaultValue={kontak?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telegram</label>
              <Input name="telegram" defaultValue={kontak?.telegram ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cara Hubung</label>
              <Input name="hubungWarga" defaultValue={kontak?.hubungWarga ?? "Telegram"} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Keterangan</label>
            <Textarea name="keterangan" defaultValue={kontak?.keterangan ?? ""} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function KontakTable({ rows, canManage }: { rows: KontakRow[]; canManage: boolean }) {
  return (
    <div className="space-y-4">
      {canManage && <KontakFormDialog trigger={<Button>Tambah Kontak</Button>} />}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Telepon</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Telegram</th>
                <th className="p-2 text-left">Cara Hubung</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2">{row.telepon ?? "-"}</td>
                  <td className="p-2">{row.email ?? "-"}</td>
                  <td className="p-2">{row.telegram ?? "-"}</td>
                  <td className="p-2">{row.hubungWarga ?? "-"}</td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <KontakFormDialog
                          kontak={row}
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
                            if (!confirm(`Hapus kontak "${row.nama}"?`)) return;
                            const res = await deleteKontakAction(row.id);
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
                  <td className="p-2 text-muted-foreground" colSpan={canManage ? 6 : 5}>
                    Belum ada kontak.
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
