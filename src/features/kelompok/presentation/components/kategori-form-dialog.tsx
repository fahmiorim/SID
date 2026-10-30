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
import {
  KELOMPOK_TIPE,
  KELOMPOK_TIPE_LABELS,
  type KategoriKelompokDTO,
} from "@/features/kelompok/domain/kelompok";
import { saveKategoriAction } from "@/features/kelompok/presentation/actions";
import { createIdleActionState } from "@/lib/action-state";

interface KategoriFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  kategori?: KategoriKelompokDTO | null;
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

/** Dialog formulir tambah/ubah kategori kelompok (terkendali). */
export function KategoriFormDialog({ open, onOpenChange, kategori }: KategoriFormDialogProps) {
  const isEdit = Boolean(kategori);
  const [state, formAction, isPending] = useActionState(
    saveKategoriAction,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            Kategori mengelompokkan kelompok/lembaga, mis. PKK, Karang Taruna, atau LPM.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {kategori ? <input type="hidden" name="id" value={kategori.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kategori</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={kategori?.name ?? ""}
              maxLength={100}
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipe">Tipe</Label>
            <Select name="tipe" defaultValue={kategori?.type ?? "kelompok"}>
              <SelectTrigger id="tipe" className="w-full">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                {KELOMPOK_TIPE.map((value) => (
                  <SelectItem key={value} value={value}>
                    {KELOMPOK_TIPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={fieldErrors?.tipe} />
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
