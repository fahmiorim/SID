"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type SurveiPublik } from "@/features/publik/application/survei-publik";
import { kirimSurveiPublikAction } from "@/features/survey/presentation/publik-actions";
import { createIdleActionState } from "@/lib/action-state";

export function IsiSurveiForm({ survei }: { survei: SurveiPublik }) {
  const [state, formAction, isPending] = useActionState(
    kirimSurveiPublikAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="surveyId" value={survei.id} />
      {/* Honeypot */}
      <input type="text" name="website" className="sr-only" tabIndex={-1} autoComplete="off" />

      {state.status === "error" && !state.fieldErrors && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama (Opsional)</Label>
          <Input id="nama" name="nama" maxLength={150} />
          {fieldErrors?.nama?.map((err) => (
            <p key={err} className="text-sm text-destructive">
              {err}
            </p>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nik">NIK (Opsional)</Label>
          <Input id="nik" name="nik" />
          {fieldErrors?.nik?.map((err) => (
            <p key={err} className="text-sm text-destructive">
              {err}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {survei.soal.map((soal, index) => (
          <div key={soal.id} className="space-y-2">
            <Label>
              {index + 1}. {soal.pertanyaan}
            </Label>
            {soal.tipe === "text" && <Textarea name={`jawaban.${soal.id}`} required />}
            {soal.tipe === "number" && <Input type="number" name={`jawaban.${soal.id}`} required />}
            {soal.tipe === "choice" && (
              <div className="space-y-2">
                {soal.pilihan.map((pilihan) => (
                  <div key={pilihan} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`soal-${soal.id}-${pilihan}`}
                      name={`jawaban.${soal.id}`}
                      value={pilihan}
                      required
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`soal-${soal.id}-${pilihan}`}>{pilihan}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Mengirim..." : "Kirim Jawaban"}
      </Button>
    </form>
  );
}
