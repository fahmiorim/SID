"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { DESKRIPSI_MAX, JUDUL_MAX, type SurveyRow } from "@/features/survey/domain/survey";
import { createIdleActionState } from "@/lib/action-state";

import { simpanSurveyAction } from "../actions";

interface SurveyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: SurveyRow | null;
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

export function SurveyFormDialog({ open, onOpenChange, survey }: SurveyFormDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(survey);
  const [state, formAction, isPending] = useActionState(
    simpanSurveyAction,
    createIdleActionState(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Survei" : "Buat Survei"}</DialogTitle>
          <DialogDescription>
            Survei aktif tampil di halaman publik beserta pertanyaannya.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {survey ? <input type="hidden" name="id" value={survey.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              required
              maxLength={JUDUL_MAX}
              defaultValue={survey?.judul ?? ""}
              placeholder="Contoh: Survei Kepuasan Layanan Desa 2026"
              aria-invalid={Boolean(fieldErrors?.judul)}
            />
            <FieldError messages={fieldErrors?.judul} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              maxLength={DESKRIPSI_MAX}
              defaultValue={survey?.deskripsi ?? ""}
              placeholder="Tujuan survei dan siapa yang sebaiknya mengisi."
              aria-invalid={Boolean(fieldErrors?.deskripsi)}
            />
            <FieldError messages={fieldErrors?.deskripsi} />
          </div>

          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox
              id="aktif"
              name="aktif"
              defaultChecked={survey?.aktif ?? true}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="aktif">Aktifkan survei</Label>
              <p className="text-xs text-muted-foreground">
                Survei nonaktif tetap menyimpan soal dan jawaban, tetapi tidak tampil di situs
                publik.
              </p>
            </div>
          </div>

          {state.status === "error" && !state.fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Buat survei"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
