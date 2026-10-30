"use client";

import { AlertCircle, Loader2 } from "lucide-react";
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
import { namaGoalSdgs, type SdgsDTO } from "@/features/idm/domain/idm";
import { createIdleActionState } from "@/lib/action-state";

import { saveSdgsAction } from "../idm-actions";

interface SdgsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tahun: number;
  goal: number;
  item?: SdgsDTO | null;
}

/** Formulir capaian satu tujuan SDGs Desa. */
export function SdgsFormDialog({ open, onOpenChange, tahun, goal, item }: SdgsFormDialogProps) {
  const [state, formAction, isPending] = useActionState(
    saveSdgsAction,
    createIdleActionState<{ goal: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Tujuan {goal} · {namaGoalSdgs(goal)}
          </DialogTitle>
          <DialogDescription>
            Isi capaian SDGs Desa tahun {tahun} dalam skala 0–100.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tahun" value={tahun} />
          <input type="hidden" name="goal" value={goal} />

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="skor-sdgs">Skor (0–100)</Label>
            <Input
              id="skor-sdgs"
              name="skor"
              type="number"
              min={0}
              max={100}
              defaultValue={item?.skor ?? 0}
              required
            />
            {fieldErrors?.skor ? (
              <p className="text-sm text-destructive">{fieldErrors.skor[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan-sdgs">Keterangan</Label>
            <Textarea
              id="keterangan-sdgs"
              name="keterangan"
              defaultValue={item?.keterangan ?? ""}
              maxLength={2000}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
