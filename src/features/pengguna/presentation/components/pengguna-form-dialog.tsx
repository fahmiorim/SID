"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PenggunaDTO, RoleOption } from "@/features/pengguna/domain/pengguna";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { savePenggunaAction } from "../actions";

interface PenggunaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleOption[];
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  pengguna?: PenggunaDTO | null;
  /** Akun yang sedang dipakai: grup akses & status tidak boleh diubah sendiri. */
  isSelf?: boolean;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

export function PenggunaFormDialog({
  open,
  onOpenChange,
  roles,
  pengguna,
  isSelf = false,
}: PenggunaFormDialogProps) {
  const isEdit = Boolean(pengguna);
  const [state, formAction, isPending] = useActionState(savePenggunaAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Pengguna" : "Tambah Pengguna"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data akun, grup akses, atau kata sandi pengguna."
              : "Buat akun pengguna baru untuk mengakses aplikasi."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {pengguna ? <input type="hidden" name="id" value={pengguna.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              defaultValue={pengguna?.name ?? ""}
              maxLength={100}
              required
              autoFocus
              aria-invalid={Boolean(fieldErrors?.name)}
            />
            <FieldError messages={fieldErrors?.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={pengguna?.username ?? ""}
                maxLength={100}
                autoComplete="off"
                required
                aria-invalid={Boolean(fieldErrors?.username)}
              />
              <FieldError messages={fieldErrors?.username} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opsional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={pengguna?.email ?? ""}
                maxLength={255}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors?.email)}
              />
              <FieldError messages={fieldErrors?.email} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roleId">Grup Akses</Label>
              <Select
                name={isSelf ? undefined : "roleId"}
                defaultValue={pengguna?.roleId ? String(pengguna.roleId) : NO_SELECTION}
                disabled={isSelf}
              >
                <SelectTrigger id="roleId" className="w-full">
                  <SelectValue placeholder="Pilih grup akses" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf ? (
                <input
                  type="hidden"
                  name="roleId"
                  value={String(pengguna?.roleId ?? NO_SELECTION)}
                />
              ) : null}
              <FieldError messages={fieldErrors?.roleId} />
              {isSelf ? (
                <p className="text-xs text-muted-foreground">
                  Grup akses akun sendiri tidak dapat diubah.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isEdit ? "Kata Sandi Baru (opsional)" : "Kata Sandi"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required={!isEdit}
                aria-invalid={Boolean(fieldErrors?.password)}
              />
              <FieldError messages={fieldErrors?.password} />
              {isEdit ? (
                <p className="text-xs text-muted-foreground">
                  Kosongkan bila kata sandi tidak diubah.
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isSelf ? <input type="hidden" name="active" value="on" /> : null}
            <Checkbox
              id="active"
              name={isSelf ? undefined : "active"}
              defaultChecked={pengguna?.active ?? true}
              disabled={isSelf}
            />
            <Label htmlFor="active">Akun aktif (dapat masuk)</Label>
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
