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
import type { SisaLebihDTO } from "@/features/keuangan/domain/sisa-lebih";
import { createIdleActionState } from "@/lib/action-state";

import {
  createSisaLebihAction,
  deleteSisaLebihAction,
  updateSisaLebihAction,
} from "../sisa-lebih-actions";

interface SisaLebihFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: SisaLebihDTO | null;
}

export function SisaLebihFormDialog({ open, onOpenChange, item }: SisaLebihFormDialogProps) {
  const isEdit = Boolean(item);
  const [createState, createAction, isCreatePending] = useActionState(
    createSisaLebihAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [updateState, updateAction, isUpdatePending] = useActionState(
    updateSisaLebihAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteSisaLebihAction,
    createIdleActionState<{ id: number } | null>(),
  );

  const state = isEdit ? updateState : createState;
  const formAction = isEdit ? updateAction : createAction;
  const isPending = isEdit ? isUpdatePending : isCreatePending;
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
          <DialogTitle>{isEdit ? "Ubah Data SiLPA" : "Tambah Data SiLPA"}</DialogTitle>
          <DialogDescription>Pengelolaan Sisa Lebih Pembiayaan (SiLPA)</DialogDescription>
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
            <Label htmlFor="tahun">Tahun</Label>
            <Input
              id="tahun"
              name="tahun"
              type="number"
              defaultValue={item?.tahun ?? new Date().getFullYear()}
              required
            />
            {fieldErrors?.tahun ? (
              <p className="text-sm text-destructive">{fieldErrors.tahun[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              name="jumlah"
              defaultValue={item?.jumlah ?? ""}
              placeholder="Rp..."
              required
            />
            {fieldErrors?.jumlah ? (
              <p className="text-sm text-destructive">{fieldErrors.jumlah[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input id="tanggal" name="tanggal" type="date" defaultValue={item?.tanggal ?? ""} />
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
