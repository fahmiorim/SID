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
import type { IdmIndikatorDTO } from "@/features/idm/domain/idm";
import { createIdleActionState } from "@/lib/action-state";

import { saveIdmAction } from "../idm-actions";

interface IdmFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: IdmIndikatorDTO | null;
  tahun: number;
}

export function IdmFormDialog({ open, onOpenChange, item, tahun }: IdmFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    saveIdmAction,
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
          <DialogTitle>{isEdit ? "Ubah Indikator IDM" : "Tambah Indikator IDM"}</DialogTitle>
          <DialogDescription>Input indikator Indeks Desa Membangun (IDM)</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tahun" value={item?.tahun ?? tahun} />

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="kode">Kode</Label>
            <Input
              id="kode"
              name="kode"
              defaultValue={item?.kode ?? ""}
              placeholder="I.DM.01"
              required
            />
            {fieldErrors?.kode ? (
              <p className="text-sm text-destructive">{fieldErrors.kode[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Indikator</Label>
            <Input id="nama" name="nama" defaultValue={item?.nama ?? ""} required />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skor">Skor</Label>
              <Input
                id="skor"
                name="skor"
                type="number"
                min={0}
                max={100}
                defaultValue={item?.skor ?? 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Input
                id="kategori"
                name="kategori"
                defaultValue={item?.kategori ?? ""}
                placeholder="Maju/Berkembang/..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea id="keterangan" name="keterangan" defaultValue={item?.keterangan ?? ""} />
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
