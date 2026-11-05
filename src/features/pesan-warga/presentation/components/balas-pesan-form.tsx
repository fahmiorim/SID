"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIdleActionState } from "@/lib/action-state";

import { balasPesanWargaAction } from "../admin-actions";

/** Form balasan operator pada satu percakapan warga. */
export function BalasPesanForm({ residentId }: { residentId: number }) {
  const [state, formAction, isPending] = useActionState(
    balasPesanWargaAction,
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
    <form ref={formRef} action={formAction} className="space-y-2 border-t pt-4">
      <input type="hidden" name="residentId" value={residentId} />
      <Label htmlFor={`balasan-${residentId}`}>Balasan operator</Label>
      <Textarea
        id={`balasan-${residentId}`}
        name="isi"
        rows={3}
        maxLength={2000}
        placeholder="Tulis balasan untuk warga…"
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
              Kirim balasan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
