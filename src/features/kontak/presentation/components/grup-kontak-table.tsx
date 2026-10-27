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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addAnggotaGrupAction,
  deleteKontakGrupAction,
  listAnggotaGrupAction,
  removeAnggotaGrupAction,
  saveKontakGrupAction,
} from "@/features/kontak/presentation/actions-kontak";

export interface GrupKontakRow {
  id: number;
  namaGrup: string;
  keterangan: string | null;
}

interface AnggotaRow {
  id: number;
  kontakId: number;
  nama: string;
  telepon: string | null;
}

function GrupFormDialog({ grup, trigger }: { grup?: GrupKontakRow; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{grup ? "Ubah Grup Kontak" : "Tambah Grup Kontak"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await saveKontakGrupAction(formData);
            if (res.ok) setOpen(false);
            else setError(res.message ?? "Gagal menyimpan.");
          }}
          className="space-y-3"
        >
          {grup && <input type="hidden" name="id" value={grup.id} />}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Grup</label>
            <Input name="namaGrup" required defaultValue={grup?.namaGrup ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Keterangan</label>
            <Textarea name="keterangan" defaultValue={grup?.keterangan ?? ""} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnggotaDialog({
  grup,
  kontakOptions,
}: {
  grup: GrupKontakRow;
  kontakOptions: { id: number; nama: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AnggotaRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await listAnggotaGrupAction(grup.id);
    if (res.ok) {
      setRows(res.rows);
      setError(null);
    } else {
      setError(res.message ?? "Gagal menyimpan.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void reload();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Anggota
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anggota — {grup.namaGrup}</DialogTitle>
        </DialogHeader>

        <form
          action={async (formData) => {
            const res = await addAnggotaGrupAction(formData);
            if (res.ok) await reload();
            else setError(res.message ?? "Gagal menyimpan.");
          }}
          className="flex items-end gap-2"
        >
          <input type="hidden" name="grupId" value={grup.id} />
          <div className="min-w-0 flex-1 space-y-2">
            <label className="text-sm font-medium">Tambah Kontak</label>
            <Select name="kontakId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kontak" />
              </SelectTrigger>
              <SelectContent>
                {kontakOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Tambah</Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="max-h-64 overflow-y-auto rounded-md border">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2 text-muted-foreground">{row.telepon ?? "-"}</td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const res = await removeAnggotaGrupAction(row.id);
                        if (res.ok) await reload();
                        else setError(res.message ?? "Gagal menyimpan.");
                      }}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground">Belum ada anggota.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GrupKontakTable({
  rows,
  kontakOptions,
  canManage,
}: {
  rows: GrupKontakRow[];
  kontakOptions: { id: number; nama: string }[];
  canManage: boolean;
}) {
  return (
    <div className="space-y-4">
      {canManage && <GrupFormDialog trigger={<Button>Tambah Grup</Button>} />}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Nama Grup</th>
                <th className="p-2 text-left">Keterangan</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{row.namaGrup}</td>
                  <td className="p-2">{row.keterangan ?? "-"}</td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <AnggotaDialog grup={row} kontakOptions={kontakOptions} />
                        <GrupFormDialog
                          grup={row}
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
                            if (!confirm(`Hapus grup "${row.namaGrup}"?`)) return;
                            const res = await deleteKontakGrupAction(row.id);
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
                  <td className="p-2 text-muted-foreground" colSpan={canManage ? 3 : 2}>
                    Belum ada grup kontak.
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
