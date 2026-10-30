"use client";

import { Loader2, Mail, MessageSquare, Phone, Search } from "lucide-react";
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
  residentId: number | null;
}

function KontakFormDialog({ kontak, trigger }: { kontak?: KontakRow; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingNik, setLoadingNik] = useState(false);

  const handleNikBlur = async (nik: string) => {
    if (!nik || nik.length !== 16) return;
    setLoadingNik(true);
    try {
      const res = await fetch(`/api/penduduk/nik?nik=${nik}`);
      const data = await res.json();
      if (data.ok && data.resident) {
        // Set the residentId field value
        const input = document.querySelector('input[name="residentId"]') as HTMLInputElement;
        if (input) {
          input.value = String(data.resident.id);
          // Trigger onChange to update form state
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        // Auto-fill nama if empty
        const namaInput = document.querySelector('input[name="nama"]') as HTMLInputElement;
        if (namaInput && !namaInput.value) {
          namaInput.value = data.resident.label;
          namaInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingNik(false);
    }
  };

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
          <div className="space-y-2">
            <label className="text-sm font-medium">NIK Penduduk (opsional)</label>
            <div className="flex gap-2">
              <Input
                name="residentId"
                type="number"
                min="1"
                placeholder="NIK atau ID Penduduk"
                defaultValue={kontak?.residentId ?? ""}
                onBlur={(e) => handleNikBlur(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" disabled={loadingNik}>
                {loadingNik ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Kosongkan untuk kontak eksternal. Isi NIK 16 digit untuk auto-mengisi data penduduk.
            </p>
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
                <th className="p-2 text-left">NIK Penduduk</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2">
                    {row.telepon ? (
                      <a
                        href={`tel:${row.telepon}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Phone className="size-3" />
                        {row.telepon}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    {row.email ? (
                      <a
                        href={`mailto:${row.email}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="size-3" />
                        {row.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    {row.telegram ? (
                      <a
                        href={`https://t.me/${row.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <MessageSquare className="size-3" />
                        {row.telegram}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-2">{row.hubungWarga ?? "-"}</td>
                  <td className="p-2">
                    {row.residentId ? (
                      String(row.residentId)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
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
