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
import type { KeluargaDTO, KeluargaReferenceData } from "@/features/keluarga/domain/keluarga";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { saveKeluargaAction } from "../actions";

interface KeluargaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: KeluargaReferenceData;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  keluarga?: KeluargaDTO | null;
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
 * Dialog formulir tambah/ubah Kartu Keluarga (terkendali).
 *
 * Radix membongkar isi dialog saat tertutup, sehingga state `useActionState`
 * otomatis kembali bersih setiap kali dialog dibuka.
 */
export function KeluargaFormDialog({
  open,
  onOpenChange,
  reference,
  keluarga,
}: KeluargaFormDialogProps) {
  const isEdit = Boolean(keluarga);
  const [state, formAction, isPending] = useActionState(
    saveKeluargaAction,
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
          <DialogTitle>{isEdit ? "Ubah Kartu Keluarga" : "Tambah Kartu Keluarga"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data Kartu Keluarga."
              : "Catat Kartu Keluarga baru, lalu tautkan penduduk ke dalamnya."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {keluarga ? <input type="hidden" name="id" value={keluarga.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="number">Nomor Kartu Keluarga</Label>
            <Input
              id="number"
              name="number"
              defaultValue={keluarga?.number ?? ""}
              placeholder="16 angka"
              inputMode="numeric"
              maxLength={16}
              autoFocus
              required
              aria-invalid={Boolean(fieldErrors?.number)}
            />
            <FieldError messages={fieldErrors?.number} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regionId">Wilayah</Label>
            <Select
              name="regionId"
              defaultValue={keluarga?.regionId ? String(keluarga.regionId) : NO_SELECTION}
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
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              name="address"
              defaultValue={keluarga?.address ?? ""}
              maxLength={255}
              aria-invalid={Boolean(fieldErrors?.address)}
            />
            <FieldError messages={fieldErrors?.address} />
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
