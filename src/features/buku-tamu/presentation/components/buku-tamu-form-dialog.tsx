"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
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
import type { BukuTamuDTO } from "@/features/buku-tamu/domain/buku-tamu";
import { createIdleActionState } from "@/lib/action-state";

import {
  createBukuTamuAction,
  deleteBukuTamuAction,
  updateBukuTamuAction,
} from "../buku-tamu-actions";

interface BukuTamuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BukuTamuDTO | null;
}

export function BukuTamuFormDialog({ open, onOpenChange, item }: BukuTamuFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateBukuTamuAction : createBukuTamuAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  function handleDelete() {
    if (!item) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteBukuTamuAction(item.id);
      if (result.status === "success") {
        toast.success(result.message);
        onOpenChange(false);
      } else if (result.status === "error") {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Buku Tamu" : "Tambah Buku Tamu"}</DialogTitle>
          <DialogDescription>Kelola data buku tamu desa</DialogDescription>
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
            <Label htmlFor="nama">Nama Tamu</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={item?.nama ?? ""}
              placeholder="Nama lengkap"
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instansi">Instansi</Label>
            <Input
              id="instansi"
              name="instansi"
              defaultValue={item?.instansi ?? ""}
              placeholder="Instansi/perusahaan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keperluan">Keperluan</Label>
            <Textarea
              id="keperluan"
              name="keperluan"
              defaultValue={item?.keperluan ?? ""}
              placeholder="Keperluan kunjungan"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={item?.tanggal ?? new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jamMasuk">Jam Masuk</Label>
              <Input
                id="jamMasuk"
                name="jamMasuk"
                type="time"
                defaultValue={item?.jamMasuk ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jamKeluar">Jam Keluar</Label>
              <Input
                id="jamKeluar"
                name="jamKeluar"
                type="time"
                defaultValue={item?.jamKeluar ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea id="keterangan" name="keterangan" defaultValue={item?.keterangan ?? ""} />
          </div>

          {deleteError ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="flex justify-between">
            {isEdit && item ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </Button>
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
