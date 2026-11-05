"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIdleActionState } from "@/lib/action-state";

import { kirimPesanWargaAction } from "../warga-actions";

/** Form kirim pesan warga ke operator desa. */
export function PesanWargaForm() {
  const [state, formAction, isPending] = useActionState(
    kirimPesanWargaAction,
    createIdleActionState<null>(),
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <Label htmlFor="isi">Tulis pesan</Label>
      <Textarea
        id="isi"
        name="isi"
        rows={3}
        maxLength={2000}
        placeholder="Tulis pertanyaan atau catatan untuk operator desa…"
        required
      />
      {fieldErrors?.isi ? <p className="text-sm text-destructive">{fieldErrors.isi[0]}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Mengirim…
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Kirim
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
