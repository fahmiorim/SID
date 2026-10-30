"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { JAWABAN_KEPUASAN } from "@/features/pendapat/domain/pendapat";
import { submitPendapatPublikAction } from "@/features/pendapat/presentation/actions-pendapat";
import { idleActionState } from "@/lib/action-state";

/** Formulir jajak pendapat publik dengan umpan balik sukses/gagal. */
export function PendapatPublikForm() {
  const [state, formAction, isPending] = useActionState(
    submitPendapatPublikAction,
    idleActionState,
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <label htmlFor="pengguna" className="text-sm font-medium">
          Nama (opsional)
        </label>
        <input
          id="pengguna"
          name="pengguna"
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Nama atau inisial"
        />
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Penilaian pelayanan</span>
        <div className="space-y-2">
          {JAWABAN_KEPUASAN.map((j) => (
            <label key={j.value} className="flex items-center gap-2 text-sm">
              <input type="radio" name="pilihan" value={j.value} required />
              {j.label}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Mengirim…" : "Kirim Pendapat"}
      </button>
    </form>
  );
}
