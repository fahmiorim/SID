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
import type { KlasifikasiSuratDTO } from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";

import { saveKlasifikasiAction } from "../master-actions";

interface KlasifikasiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klasifikasi?: KlasifikasiSuratDTO | null;
}

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

export function KlasifikasiFormDialog({
  open,
  onOpenChange,
  klasifikasi,
}: KlasifikasiFormDialogProps) {
  const isEdit = Boolean(klasifikasi);
  const [state, formAction, isPending] = useActionState(saveKlasifikasiAction, idleActionState);
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
          <DialogTitle>{isEdit ? "Ubah Klasifikasi" : "Tambah Klasifikasi"}</DialogTitle>
          <DialogDescription>
            Kode klasifikasi dipakai pada jenis dan agenda surat.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {klasifikasi ? <input type="hidden" name="id" value={klasifikasi.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="code">Kode</Label>
            <Input
              id="code"
              name="code"
              defaultValue={klasifikasi?.code ?? ""}
              maxLength={20}
              required
              autoFocus
              aria-invalid={Boolean(fieldErrors?.code)}
            />
            <FieldError messages={fieldErrors?.code} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              defaultValue={klasifikasi?.name ?? ""}
              maxLength={100}
              required
              aria-invalid={Boolean(fieldErrors?.name)}
            />
            <FieldError messages={fieldErrors?.name} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
