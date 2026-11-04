"use client";

import { Loader2, XCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIdleActionState } from "@/lib/action-state";

import { batalkanPermohonanWargaAction } from "../warga-actions";

export function BatalkanPermohonanWargaButton({ permohonanId }: { permohonanId: number }) {
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [state, formAction, isPending] = useActionState(
    batalkanPermohonanWargaAction,
    createIdleActionState<null>(),
  );

  if (state.status === "success") {
    toast.success(state.message);
  }
  if (state.status === "error") {
    toast.error(state.message);
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <XCircle className="size-4" />
        Batalkan
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan permohonan?</AlertDialogTitle>
            <AlertDialogDescription>
              Permohonan akan dibatalkan dan tidak bisa diproses lagi. Alasan wajib diisi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="id" value={permohonanId} />
            <Label htmlFor={`alasan-batal-${permohonanId}`}>Alasan pembatalan</Label>
            <Input
              id={`alasan-batal-${permohonanId}`}
              name="alasan"
              value={alasan}
              onChange={(event) => setAlasan(event.target.value)}
              placeholder="Alasan..."
            />
            {state.status === "error" ? (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isPending}>
                Batal
              </AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={isPending || !alasan.trim()}>
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Batalkan permohonan
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
