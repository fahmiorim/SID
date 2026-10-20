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
import type { ModulDTO, ModulOption } from "@/features/modul/domain/modul";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { saveModulAction } from "../actions";

interface ModulFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modul?: ModulDTO | null;
  parents: ModulOption[];
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

export function ModulFormDialog({ open, onOpenChange, modul, parents }: ModulFormDialogProps) {
  const isEdit = Boolean(modul);
  const [state, formAction, isPending] = useActionState(saveModulAction, idleActionState);
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
          <DialogTitle>{isEdit ? "Ubah Modul" : "Tambah Modul"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data modul." : "Buat modul baru."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {modul ? <input type="hidden" name="id" value={modul.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Modul</Label>
              <Input
                id="name"
                name="name"
                defaultValue={modul?.name ?? ""}
                maxLength={100}
                required
                aria-invalid={Boolean(fieldErrors?.name)}
              />
              <FieldError messages={fieldErrors?.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={modul?.slug ?? ""}
                maxLength={100}
                required
                aria-invalid={Boolean(fieldErrors?.slug)}
              />
              <FieldError messages={fieldErrors?.slug} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Induk Modul</Label>
            <Select
              name="parentId"
              defaultValue={modul?.parentId ? String(modul.parentId) : NO_SELECTION}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih induk modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SELECTION}>Tidak ada</SelectItem>
                {parents.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                defaultValue={modul?.url ?? ""}
                maxLength={255}
                aria-invalid={Boolean(fieldErrors?.url)}
              />
              <FieldError messages={fieldErrors?.url} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ikon</Label>
              <Input
                id="icon"
                name="icon"
                defaultValue={modul?.icon ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.icon)}
              />
              <FieldError messages={fieldErrors?.icon} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Urutan</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={modul?.sortOrder ?? 0}
                min={0}
              />
            </div>
            <div className="flex items-center space-x-2 pt-7">
              <Checkbox id="isGroup" name="isGroup" defaultChecked={modul?.isGroup ?? false} />
              <Label htmlFor="isGroup">Grup</Label>
            </div>
            <div className="flex items-center space-x-2 pt-7">
              <Checkbox id="isActive" name="isActive" defaultChecked={modul?.isActive ?? true} />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
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
