"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { LapakProdukDTO } from "@/features/lapak/domain/lapak-produk";
import { createIdleActionState } from "@/lib/action-state";

import { createProdukLapakAction, updateProdukLapakAction } from "../lapak-produk-actions";

interface ProdukFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lapakId: number;
  item?: LapakProdukDTO | null;
}

export function ProdukFormDialog({ open, onOpenChange, lapakId, item }: ProdukFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateProdukLapakAction : createProdukLapakAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Produk" : "Tambah Produk"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data produk lapak ini." : "Tambahkan produk baru ke lapak ini."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="lapakId" value={lapakId} />
          {isEdit && <input type="hidden" name="id" value={item?.id} />}

          {state.status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          {state.status === "success" && (
            <Alert>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Produk *</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={item?.nama ?? ""}
              placeholder="Nama produk"
              className={fieldErrors?.nama ? "border-destructive" : ""}
            />
            {fieldErrors?.nama && (
              <p className="text-xs text-destructive">{fieldErrors.nama.join(", ")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              defaultValue={item?.deskripsi ?? ""}
              placeholder="Deskripsi produk (opsional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="harga">Harga (Rp)</Label>
              <Input
                id="harga"
                name="harga"
                type="text"
                inputMode="numeric"
                defaultValue={item?.harga ?? ""}
                placeholder="25000"
                className={fieldErrors?.harga ? "border-destructive" : ""}
              />
              {fieldErrors?.harga && (
                <p className="text-xs text-destructive">{fieldErrors.harga.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stok">Stok</Label>
              <Input
                id="stok"
                name="stok"
                type="text"
                inputMode="numeric"
                defaultValue={item?.stok ?? ""}
                placeholder="0"
                className={fieldErrors?.stok ? "border-destructive" : ""}
              />
              {fieldErrors?.stok && (
                <p className="text-xs text-destructive">{fieldErrors.stok.join(", ")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gambar">URL Gambar</Label>
            <Input
              id="gambar"
              name="gambar"
              type="url"
              defaultValue={item?.gambar ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="text"
                defaultValue={item?.latitude ?? ""}
                placeholder="-6.1751"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="text"
                defaultValue={item?.longitude ?? ""}
                placeholder="106.8650"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="aktif" name="aktif" defaultChecked={item?.aktif ?? true} />
            <Label htmlFor="aktif" className="cursor-pointer">
              Produk aktif
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
