"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
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
import type { PelangganDTO } from "@/features/pelanggan/domain/pelanggan";
import { createIdleActionState } from "@/lib/action-state";

import { createPelangganAction, updatePelangganAction } from "../pelanggan-actions";

interface PelangganFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PelangganDTO | null;
}

export function PelangganFormDialog({ open, onOpenChange, item }: PelangganFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updatePelangganAction : createPelangganAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>Manage cooperative customer data</DialogDescription>
        </DialogHeader>

        <form action={formAction} method="post" encType="multipart/form-data" className="space-y-4">
          {isEdit && item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Name</Label>
            <Input
              id="nama"
              name="nama"
              placeholder="Name perusahaan atau individu"
              defaultValue={item?.nama ?? ""}
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak">Contact</Label>
            <Input
              id="kontak"
              name="kontak"
              placeholder="Phone number or email"
              defaultValue={item?.kontak ?? ""}
            />
            {fieldErrors?.kontak ? (
              <p className="text-sm text-destructive">{fieldErrors.kontak[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Address</Label>
            <Input
              id="alamat"
              name="alamat"
              placeholder="Address kerja sama"
              defaultValue={item?.alamat ?? ""}
            />
            {fieldErrors?.alamat ? (
              <p className="text-sm text-destructive">{fieldErrors.alamat[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Description</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              placeholder="Description tambahan"
              defaultValue={item?.keterangan ?? ""}
              rows={3}
            />
            {fieldErrors?.keterangan ? (
              <p className="text-sm text-destructive">{fieldErrors.keterangan[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusLangganan">Status Langganan</Label>
            <Select name="statusLangganan" defaultValue={item?.statusLangganan ?? "menunggu"}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors?.statusLangganan ? (
              <p className="text-sm text-destructive">{fieldErrors.statusLangganan[0]}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
              <Input
                id="tanggalMulai"
                name="tanggalMulai"
                type="date"
                defaultValue={
                  item?.tanggalMulai instanceof Date
                    ? item.tanggalMulai.toISOString().split("T")[0]
                    : (item?.tanggalMulai ?? "")
                }
              />
              {fieldErrors?.tanggalMulai ? (
                <p className="text-sm text-destructive">{fieldErrors.tanggalMulai[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
              <Input
                id="tanggalSelesai"
                name="tanggalSelesai"
                type="date"
                defaultValue={
                  item?.tanggalSelesai instanceof Date
                    ? item.tanggalSelesai.toISOString().split("T")[0]
                    : (item?.tanggalSelesai ?? "")
                }
              />
              {fieldErrors?.tanggalSelesai ? (
                <p className="text-sm text-destructive">{fieldErrors.tanggalSelesai[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="noKerjasama">No. Kerjasama</Label>
            <Input
              id="noKerjasama"
              name="noKerjasama"
              placeholder="Nomor dokumen kerjasama"
              defaultValue={item?.noKerjasama ?? ""}
            />
            {fieldErrors?.noKerjasama ? (
              <p className="text-sm text-destructive">{fieldErrors.noKerjasama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keteranganLangganan">Keterangan Langganan</Label>
            <Textarea
              id="keteranganLangganan"
              name="keteranganLangganan"
              placeholder="Keterangan tambahan langganan"
              defaultValue={item?.keteranganLangganan ?? ""}
              rows={2}
            />
            {fieldErrors?.keteranganLangganan ? (
              <p className="text-sm text-destructive">{fieldErrors.keteranganLangganan[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dokumenKerjasama">Dokumen Kerjasama (PDF/JPG/PNG, maks 5 MB)</Label>
            <Input
              id="dokumenKerjasama"
              name="dokumenKerjasama"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {item?.dokumenNama ? (
              <p className="text-sm text-muted-foreground">Dokumen saat ini: {item.dokumenNama}</p>
            ) : null}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
