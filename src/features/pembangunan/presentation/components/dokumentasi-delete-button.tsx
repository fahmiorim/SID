"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { idleActionState } from "@/lib/action-state";

import { deleteDokumentasiAction } from "../actions";

/** Tombol hapus satu foto dokumentasi. */
export function DokumentasiDeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", String(id));

    startTransition(async () => {
      const state = await deleteDokumentasiAction(idleActionState, formData);
      if (state.status === "success") {
        toast.success(state.message);
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      className="size-7"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Hapus dokumentasi"
    >
      {isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
    </Button>
  );
}
