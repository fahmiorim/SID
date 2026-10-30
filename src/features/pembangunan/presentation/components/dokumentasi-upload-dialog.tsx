"use client";

import { AlertCircle, Loader2, Upload } from "lucide-react";
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
import { idleActionState } from "@/lib/action-state";

import { saveDokumentasiAction } from "../actions";

interface DokumentasiUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyekId: number;
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

/** Dialog unggah satu foto dokumentasi proyek. */
export function DokumentasiUploadDialog({
  open,
  onOpenChange,
  proyekId,
}: DokumentasiUploadDialogProps) {
  const [state, formAction, isPending] = useActionState(saveDokumentasiAction, idleActionState);
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
          <DialogTitle>Unggah Dokumentasi</DialogTitle>
          <DialogDescription>Tambahkan foto progres atau hasil proyek.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="proyekId" value={proyekId} />

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="gambar">Berkas Foto</Label>
            <Input
              id="gambar"
              name="gambar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              aria-invalid={Boolean(fieldErrors?.gambar)}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP, GIF, atau SVG maksimal 5 MB.
            </p>
            <FieldError messages={fieldErrors?.gambar} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              maxLength={150}
              aria-invalid={Boolean(fieldErrors?.judul)}
            />
            <FieldError messages={fieldErrors?.judul} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              rows={2}
              maxLength={500}
              aria-invalid={Boolean(fieldErrors?.keterangan)}
            />
            <FieldError messages={fieldErrors?.keterangan} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
              Unggah
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
