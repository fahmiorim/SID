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
import type { WilayahDTO } from "@/features/wilayah/domain/wilayah";
import { idleActionState } from "@/lib/action-state";

import { saveWilayahAction } from "../actions";

interface WilayahFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  wilayah?: WilayahDTO | null;
}

/**
 * Dialog formulir tambah/ubah wilayah (terkendali).
 *
 * Radix membongkar isi dialog saat tertutup, sehingga state `useActionState`
 * otomatis kembali bersih setiap kali dialog dibuka.
 */
export function WilayahFormDialog({ open, onOpenChange, wilayah }: WilayahFormDialogProps) {
  const isEdit = Boolean(wilayah);
  const [state, formAction, isPending] = useActionState(saveWilayahAction, idleActionState);
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
          <DialogTitle>{isEdit ? "Ubah Wilayah" : "Tambah Wilayah"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data wilayah administratif."
              : "Tambahkan dusun, RW, atau RT baru pada desa ini."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {wilayah ? <input type="hidden" name="id" value={wilayah.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="dusun">Dusun</Label>
            <Input
              id="dusun"
              name="dusun"
              defaultValue={wilayah?.dusun ?? ""}
              placeholder="mis. Sukamaju"
              maxLength={100}
              autoFocus
              required
              aria-invalid={Boolean(fieldErrors?.dusun)}
            />
            {fieldErrors?.dusun?.map((message) => (
              <p key={message} className="text-xs text-destructive">
                {message}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rw">RW</Label>
              <Input
                id="rw"
                name="rw"
                defaultValue={wilayah?.rw ?? ""}
                placeholder="mis. 01"
                maxLength={10}
                aria-invalid={Boolean(fieldErrors?.rw)}
              />
              {fieldErrors?.rw?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rt">RT</Label>
              <Input
                id="rt"
                name="rt"
                defaultValue={wilayah?.rt ?? ""}
                placeholder="mis. 02"
                maxLength={10}
                aria-invalid={Boolean(fieldErrors?.rt)}
              />
              {fieldErrors?.rt?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urut">Urutan</Label>
            <Input
              id="urut"
              name="urut"
              type="number"
              min={0}
              max={9999}
              defaultValue={wilayah?.urut ?? 0}
              aria-invalid={Boolean(fieldErrors?.urut)}
            />
            {fieldErrors?.urut?.map((message) => (
              <p key={message} className="text-xs text-destructive">
                {message}
              </p>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
