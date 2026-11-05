"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createIdleActionState } from "@/lib/action-state";

import { balasSmsAction } from "../mailbox-actions";

export function SmsReplyForm({ nomor }: { nomor: string }) {
  const [state, formAction, isPending] = useActionState(
    balasSmsAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="nomor" value={nomor} />
      <textarea
        name="isi"
        rows={2}
        required
        maxLength={2000}
        placeholder={`Balas ${nomor}...`}
        className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" size="sm" disabled={isPending} className="self-end">
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Send className="mr-2 size-4" />
        )}
        Kirim
      </Button>
    </form>
  );
}
