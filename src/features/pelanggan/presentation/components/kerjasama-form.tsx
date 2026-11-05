"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { createIdleActionState } from "@/lib/action-state";

import { createPelangganAction } from "../pelanggan-actions";

export function KerjasamaForm() {
  const [open, setOpen] = useState(true);
  const [state, formAction, isPending] = useActionState(
    createPelangganAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Pendaftaran kerja sama berhasil disimpan");
      setTimeout(() => setOpen(false), 1000);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pendaftaran Kerja Sama Baru</DialogTitle>
          <DialogDescription>Lengkapi data pelanggan dan detail kerja sama</DialogDescription>
        </DialogHeader>

        <form action={formAction} method="post" encType="multipart/form-data" className="space-y-4">
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Pelanggan</Label>
            <Input id="nama" name="nama" placeholder="Nama perusahaan/individu" required />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak">Kontak</Label>
            <Input id="kontak" name="kontak" placeholder="Telp/Email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input id="alamat" name="alamat" placeholder="Alamat lengkap" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusLangganan">Status Langganan</Label>
            <Select name="statusLangganan" defaultValue="menunggu">
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
              <Input id="tanggalMulai" name="tanggalMulai" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
              <Input id="tanggalSelesai" name="tanggalSelesai" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="noKerjasama">No. Kerjasama</Label>
            <Input id="noKerjasama" name="noKerjasama" placeholder="Nomor dokumen" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keteranganLangganan">Keterangan Langganan</Label>
            <Textarea
              id="keteranganLangganan"
              name="keteranganLangganan"
              placeholder="Detail kerjasama"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dokumenKerjasama">Dokumen Kerjasama (PDF/JPG/PNG, maks 5 MB)</Label>
            <Input
              id="dokumenKerjasama"
              name="dokumenKerjasama"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
