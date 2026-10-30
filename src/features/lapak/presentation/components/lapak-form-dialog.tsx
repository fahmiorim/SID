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
import { Textarea } from "@/components/ui/textarea";
import type { LapakDTO } from "@/features/lapak/domain/lapak";
import { createIdleActionState } from "@/lib/action-state";

import { createLapakAction, deleteLapakAction, updateLapakAction } from "../lapak-actions";

interface LapakFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: LapakDTO | null;
  kategoriList: string[];
}

export function LapakFormDialog({ open, onOpenChange, item, kategoriList }: LapakFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateLapakAction : createLapakAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteLapakAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (deleteState.status === "success") {
      toast.success(deleteState.message);
      onOpenChange(false);
    }
  }, [deleteState, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Lapak" : "Tambah Lapak"}</DialogTitle>
          <DialogDescription>Kelola data lapak UMKM desa</DialogDescription>
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
              defaultValue={item?.nama ?? ""}
              placeholder="Nama usaha/warung"
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
              defaultValue={item?.pemilik ?? ""}
              placeholder="Nama pemilik"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Input
              id="kategori"
              name="kategori"
              list="kategori-suggestions"
              defaultValue={item?.kategori ?? ""}
              placeholder="Makanan, Minuman, Jasa, dll"
            />
            <datalist id="kategori-suggestions">
              {kategoriList.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              name="alamat"
              defaultValue={item?.alamat ?? ""}
              placeholder="Alamat lengkap lapak"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea id="keterangan" name="keterangan" defaultValue={item?.keterangan ?? ""} />
          </div>

          <DialogFooter className="flex justify-between">
            {isEdit && item ? (
              <form action={deleteAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" variant="destructive" disabled={isDeletePending}>
                  {isDeletePending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </Button>
              </form>
            ) : (
              <div />
            )}
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
