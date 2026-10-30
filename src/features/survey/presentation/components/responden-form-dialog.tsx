"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { SoalRow } from "@/features/survey/domain/survey";
import { createIdleActionState } from "@/lib/action-state";

import { simpanRespondenAction } from "../actions";

interface RespondenFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: number;
  soal: SoalRow[];
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

/** Formulir responden; satu field per pertanyaan (`jawaban.<soalId>`). */
export function RespondenFormDialog({
  open,
  onOpenChange,
  surveyId,
  soal,
}: RespondenFormDialogProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    simpanRespondenAction,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Responden</DialogTitle>
          <DialogDescription>
            Semua pertanyaan wajib dijawab agar rekap survei lengkap.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="surveyId" value={surveyId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama responden</Label>
              <Input
                id="nama"
                name="nama"
                required
                maxLength={150}
                placeholder="Nama lengkap"
                aria-invalid={Boolean(fieldErrors?.nama)}
              />
              <FieldError messages={fieldErrors?.nama} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input
                id="nik"
                name="nik"
                inputMode="numeric"
                maxLength={16}
                placeholder="Opsional, 16 angka"
                aria-invalid={Boolean(fieldErrors?.nik)}
              />
              <FieldError messages={fieldErrors?.nik} />
            </div>
          </div>

          <div className="space-y-5 border-t pt-4">
            {soal.map((item, index) => {
              const field = `jawaban.${item.id}`;
              const errors = fieldErrors?.[field];

              return (
                <div key={item.id} className="space-y-2">
                  <Label htmlFor={field}>
                    {index + 1}. {item.pertanyaan}
                  </Label>

                  {item.tipe === "choice" ? (
                    <div className="space-y-2">
                      {item.pilihan.map((pilihan) => (
                        <label key={pilihan} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={field}
                            value={pilihan}
                            required
                            className="size-4 accent-primary"
                          />
                          {pilihan}
                        </label>
                      ))}
                    </div>
                  ) : item.tipe === "number" ? (
                    <Input
                      id={field}
                      name={field}
                      type="number"
                      step="any"
                      required
                      aria-invalid={Boolean(errors)}
                    />
                  ) : (
                    <Textarea
                      id={field}
                      name={field}
                      rows={2}
                      required
                      aria-invalid={Boolean(errors)}
                    />
                  )}

                  <FieldError messages={errors} />
                </div>
              );
            })}
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
              Simpan responden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
