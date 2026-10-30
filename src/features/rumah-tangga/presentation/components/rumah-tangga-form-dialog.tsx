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
import type {
  RumahTanggaDTO,
  RumahTanggaReferenceData,
} from "@/features/rumah-tangga/domain/rumah-tangga";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { saveRumahTanggaAction } from "../actions";

interface RumahTanggaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: RumahTanggaReferenceData;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  rumahTangga?: RumahTanggaDTO | null;
}

/** Tampilkan pesan kesalahan validasi milik satu field. */
function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

/**
 * Dialog formulir tambah/ubah Rumah Tangga (terkendali).
 *
 * Nomor RTM tidak ditampilkan sebagai isian: dibangkitkan otomatis saat
 * penyimpanan. Radix membongkar isi dialog saat tertutup, sehingga state
 * `useActionState` otomatis kembali bersih setiap kali dialog dibuka.
 */
export function RumahTanggaFormDialog({
  open,
  onOpenChange,
  reference,
  rumahTangga,
}: RumahTanggaFormDialogProps) {
  const isEdit = Boolean(rumahTangga);
  const [state, formAction, isPending] = useActionState(
    saveRumahTanggaAction,
    createIdleActionState(),
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
          <DialogTitle>{isEdit ? "Ubah Rumah Tangga" : "Tambah Rumah Tangga"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data rumah tangga."
              : "Catat rumah tangga baru. Nomor RTM dibuat otomatis."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {rumahTangga ? <input type="hidden" name="id" value={rumahTangga.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="regionId">Wilayah</Label>
            <Select
              name="regionId"
              defaultValue={rumahTangga?.regionId ? String(rumahTangga.regionId) : NO_SELECTION}
            >
              <SelectTrigger id="regionId" className="w-full">
                <SelectValue placeholder="Pilih wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SELECTION}>—</SelectItem>
                {reference.regions.map((region) => (
                  <SelectItem key={region.id} value={String(region.id)}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={fieldErrors?.regionId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              name="alamat"
              defaultValue={rumahTangga?.address ?? ""}
              maxLength={255}
              aria-invalid={Boolean(fieldErrors?.alamat)}
            />
            <FieldError messages={fieldErrors?.alamat} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kelasSosial">Kelas Sosial</Label>
              <Input
                id="kelasSosial"
                name="kelasSosial"
                type="number"
                min={0}
                max={99}
                defaultValue={rumahTangga?.kelasSosial ?? ""}
                placeholder="0–99"
                aria-invalid={Boolean(fieldErrors?.kelasSosial)}
              />
              <FieldError messages={fieldErrors?.kelasSosial} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bdt">Nomor BDT</Label>
              <Input
                id="bdt"
                name="bdt"
                defaultValue={rumahTangga?.bdt ?? ""}
                maxLength={30}
                aria-invalid={Boolean(fieldErrors?.bdt)}
              />
              <FieldError messages={fieldErrors?.bdt} />
            </div>
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
