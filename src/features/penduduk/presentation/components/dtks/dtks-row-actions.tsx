"use client";

import { useEffect, useState } from "react";

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
  DTKS_STATUS_LABELS,
  type DtksAnggotaRow,
  type DtksDetailDTO,
} from "@/features/penduduk/domain/dtks";
import {
  deleteDtksAction,
  getDtksDetailAction,
  updateDtksAction,
} from "@/features/penduduk/presentation/actions-dtks";

export function DtksRowActions({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<DtksDetailDTO | null>(null);
  const [anggota, setAnggota] = useState<DtksAnggotaRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const res = await getDtksDetailAction(id);
      if (res.ok) {
        setDetail(res.dtks);
        setAnggota(res.anggota);
        setError(null);
      } else {
        setError(res.message);
      }
    })();
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Kelola
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kelola DTKS</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {detail && (
          <form
            key={detail.updatedAt}
            action={async (formData) => {
              const res = await updateDtksAction(formData);
              if (res.ok) setOpen(false);
              else setError(res.message);
            }}
            className="space-y-3"
          >
            <input type="hidden" name="id" value={detail.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select name="status" defaultValue={detail.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DTKS_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Pencacahan</label>
                <Input
                  type="date"
                  name="tanggalPencacahan"
                  defaultValue={detail.tanggalPencacahan ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Pemeriksaan</label>
                <Input
                  type="date"
                  name="tanggalPemeriksaan"
                  defaultValue={detail.tanggalPemeriksaan ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Petugas Pencacahan</label>
                <Input
                  name="namaPetugasPencacahan"
                  defaultValue={detail.namaPetugasPencacahan ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Responden</label>
                <Input name="namaResponden" defaultValue={detail.namaResponden ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keterangan</label>
              <Textarea name="keterangan" defaultValue={detail.keterangan ?? ""} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Anggota ({anggota.length})</p>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <tbody>
                    {anggota.map((row) => (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="p-2">{row.name}</td>
                        <td className="p-2 text-muted-foreground">{row.nationalId ?? "-"}</td>
                      </tr>
                    ))}
                    {anggota.length === 0 && (
                      <tr>
                        <td className="p-2 text-muted-foreground">Belum ada anggota.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Hapus data DTKS ini?")) return;
                  const res = await deleteDtksAction(detail.id);
                  if ("error" in res) setError(res.error);
                  else setOpen(false);
                }}
              >
                Hapus
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
