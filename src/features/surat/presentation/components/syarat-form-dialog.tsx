"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

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
import type { SyaratSuratDTO } from "@/features/surat/domain/isian";
import { idleActionState } from "@/lib/action-state";

import { saveSyaratSuratAction } from "../master-actions";

interface SyaratFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  syarat?: SyaratSuratDTO | null;
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

export function SyaratFormDialog({ open, onOpenChange, syarat }: SyaratFormDialogProps) {
  const isEdit = Boolean(syarat);
  const [state, formAction, isPending] = useActionState(saveSyaratSuratAction, idleActionState);
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
          <DialogTitle>{isEdit ? "Ubah Syarat Surat" : "Tambah Syarat Surat"}</DialogTitle>
          <DialogDescription>
            Syarat dipakai sebagai kelengkapan berkas pada jenis surat.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {syarat ? <input type="hidden" name="id" value={syarat.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Syarat</Label>
            <Input
              id="name"
              name="name"
              defaultValue={syarat?.name ?? ""}
              maxLength={150}
              placeholder="Mis. Fotokopi KTP"
              required
              autoFocus
              aria-invalid={Boolean(fieldErrors?.name)}
            />
            <FieldError messages={fieldErrors?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={syarat?.description ?? ""}
              maxLength={1000}
              placeholder="Catatan kelengkapan berkas"
              aria-invalid={Boolean(fieldErrors?.description)}
            />
            <FieldError messages={fieldErrors?.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Urutan</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                max={9999}
                defaultValue={syarat?.sortOrder ?? 0}
              />
              <FieldError messages={fieldErrors?.sortOrder} />
            </div>

            <div className="flex items-center gap-2 pt-7">
              <Checkbox id="isActive" name="isActive" defaultChecked={syarat?.isActive ?? true} />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
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
