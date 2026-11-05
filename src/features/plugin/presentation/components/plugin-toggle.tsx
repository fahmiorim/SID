"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createIdleActionState } from "@/lib/action-state";

import { ubahStatusPluginAction } from "../plugin-actions";

export function PluginToggle({
  slug,
  aktif,
  nonaktifkan,
}: {
  slug: string;
  aktif: boolean;
  nonaktifkan?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    ubahStatusPluginAction,
    createIdleActionState<string | null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="aktif" value={String(!aktif)} />
      <Button
        type="submit"
        size="sm"
        variant={nonaktifkan ? "outline" : "default"}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {aktif ? "Nonaktifkan" : "Aktifkan"}
      </Button>
    </form>
  );
}
