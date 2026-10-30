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
import type { ArsipDTO } from "@/features/arsip/domain/arsip";
import { createIdleActionState } from "@/lib/action-state";

import { createArsipAction, deleteArsipAction, updateArsipAction } from "../arsip-actions";

interface ArsipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ArsipDTO | null;
  kategoriList: string[];
}

export function ArsipFormDialog({ open, onOpenChange, item, kategoriList }: ArsipFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateArsipAction : createArsipAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteArsipAction,
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
          <DialogTitle>{isEdit ? "Ubah Arsip" : "Tambah Arsip"}</DialogTitle>
          <DialogDescription>Kelola data arsip desa</DialogDescription>
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
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              defaultValue={item?.judul ?? ""}
              placeholder="Judul dokumen/arsip"
              required
            />
            {fieldErrors?.judul ? (
              <p className="text-sm text-destructive">{fieldErrors.judul[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Input
              id="kategori"
              name="kategori"
              list="kategori-suggestions"
              defaultValue={item?.kategori ?? ""}
              placeholder="Surat, Laporan, Peraturan, dll"
            />
            <datalist id="kategori-suggestions">
              {kategoriList.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="berkas">Berkas (URL/Path)</Label>
            <Input
              id="berkas"
              name="berkas"
              defaultValue={item?.berkas ?? ""}
              placeholder="/path/ke/file.pdf atau https://..."
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
