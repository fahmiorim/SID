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
import type { RoleDTO } from "@/features/rbac/domain/grup";
import { createIdleActionState } from "@/lib/action-state";

import { saveRoleAction } from "../actions";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleDTO | null;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <>
      {messages.map((m) => (
        <p key={m} className="text-xs text-destructive">
          {m}
        </p>
      ))}
    </>
  );
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEdit = Boolean(role);
  const [state, formAction, isPending] = useActionState(saveRoleAction, createIdleActionState());
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
          <DialogTitle>{isEdit ? "Ubah Grup Akses" : "Tambah Grup Akses"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui nama grup akses." : "Buat grup akses baru."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {role ? <input type="hidden" name="id" value={role.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Grup</Label>
            <Input
              id="name"
              name="name"
              defaultValue={role?.name ?? ""}
              maxLength={100}
              required
              autoFocus
              aria-invalid={Boolean(fieldErrors?.name)}
            />
            <FieldError messages={fieldErrors?.name} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
