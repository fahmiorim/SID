"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PelangganDTO } from "@/features/pelanggan/domain/pelanggan";
import { createIdleActionState } from "@/lib/action-state";

import { updateStatusLanggananAction } from "../pelanggan-actions";

interface StatusLanggananDropdownProps {
  item: PelangganDTO;
}

export function StatusLanggananDropdown({ item }: StatusLanggananDropdownProps) {
  const [open, setOpen] = useState(false);
  const [_state, formAction, isPending] = useActionState(
    updateStatusLanggananAction,
    createIdleActionState<{ id: number } | null>(),
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Ubah Status
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Status Langganan</DialogTitle>
            <DialogDescription>Perbarui status langganan untuk {item.nama}</DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={item.id} />

            <div className="space-y-2">
              <Label htmlFor="statusLangganan">Status Langganan</Label>
              <Select name="statusLangganan" defaultValue={item.statusLangganan ?? "menunggu"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                <Input
                  id="tanggalMulai"
                  name="tanggalMulai"
                  type="date"
                  defaultValue={
                    item.tanggalMulai instanceof Date
                      ? item.tanggalMulai.toISOString().split("T")[0]
                      : (item.tanggalMulai ?? "")
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                <Input
                  id="tanggalSelesai"
                  name="tanggalSelesai"
                  type="date"
                  defaultValue={
                    item.tanggalSelesai instanceof Date
                      ? item.tanggalSelesai.toISOString().split("T")[0]
                      : (item.tanggalSelesai ?? "")
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="noKerjasama">No. Kerjasama</Label>
              <Input id="noKerjasama" name="noKerjasama" defaultValue={item.noKerjasama ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keteranganLangganan">Keterangan Langganan</Label>
              <Textarea
                id="keteranganLangganan"
                name="keteranganLangganan"
                defaultValue={item.keteranganLangganan ?? ""}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
