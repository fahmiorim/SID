"use client";

import { useState } from "react";

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
  SASARAN_KELUARGA,
  SASARAN_LABELS,
  SASARAN_PENDUDUK,
} from "@/features/penduduk/domain/suplemen";
import { createSuplemenAction } from "@/features/penduduk/presentation/actions-suplemen";

export function SuplemenDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Suplemen Baru</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Data Suplemen</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await createSuplemenAction(formData);
            if ("success" in res && res.success) {
              setOpen(false);
            } else if ("error" in res) {
              const error = res.error;
              const errorMessage =
                typeof error === "string"
                  ? error
                  : error._form?.[0] || error.nama?.[0] || "Gagal menyimpan suplemen"; // Added nama field error
              alert(errorMessage);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Suplemen</label>
            <Input name="nama" required placeholder="Contoh: Bantuan Subsidi" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sasaran</label>
            <Select name="sasaran" defaultValue={String(SASARAN_PENDUDUK)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih sasaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(SASARAN_PENDUDUK)}>
                  {SASARAN_LABELS[SASARAN_PENDUDUK]}
                </SelectItem>
                <SelectItem value={String(SASARAN_KELUARGA)}>
                  {SASARAN_LABELS[SASARAN_KELUARGA]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keterangan</label>
            <Textarea name="keterangan" placeholder="Keterangan singkat..." />
          </div>

          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
