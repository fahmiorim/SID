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
import type { LapakDTO } from "@/features/lapak/domain/lapak";
import { createIdleActionState } from "@/lib/action-state";

import { createLapakAction, updateLapakAction } from "../lapak-actions";

interface LapakFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: LapakDTO | null;
  kategoriList?: string[];
}

export function LapakFormDialog({ open, onOpenChange, item, kategoriList }: LapakFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateLapakAction : createLapakAction,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Lapak" : "Tambah Lapak"}</DialogTitle>
          <DialogDescription>Kelola data lapak UMKM</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEdit && item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lapak</Label>
            <Input
              id="nama"
              name="nama"
              placeholder="Nama lapak atau usaha"
              defaultValue={item?.nama ?? ""}
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pemilik">Pemilik</Label>
            <Input
              id="pemilik"
              name="pemilik"
              placeholder="Nama pemilik"
              defaultValue={item?.pemilik ?? ""}
            />
            {fieldErrors?.pemilik ? (
              <p className="text-sm text-destructive">{fieldErrors.pemilik[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select name="kategori" defaultValue={item?.kategori ?? ""}>
              <SelectTrigger id="kategori">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tanpa kategori</SelectItem>
                {kategoriList?.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.kategori ? (
              <p className="text-sm text-destructive">{fieldErrors.kategori[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              name="alamat"
              placeholder="Alamat lapak"
              defaultValue={item?.alamat ?? ""}
            />
            {fieldErrors?.alamat ? (
              <p className="text-sm text-destructive">{fieldErrors.alamat[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              placeholder="Keterangan tambahan"
              defaultValue={item?.keterangan ?? ""}
              rows={3}
            />
            {fieldErrors?.keterangan ? (
              <p className="text-sm text-destructive">{fieldErrors.keterangan[0]}</p>
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
