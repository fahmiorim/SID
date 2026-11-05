"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createIdleActionState } from "@/lib/action-state";

import { balasEmailAction } from "../mailbox-actions";

export function MailboxReplyForm({ id, alamat }: { id: number; alamat: string }) {
  const [state, formAction, isPending] = useActionState(
    balasEmailAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="isi"
        rows={2}
        required
        maxLength={2000}
        placeholder={`Balas ${alamat}...`}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Send className="mr-2 size-4" />
        )}
        Kirim balasan
      </Button>
    </form>
  );
}
