"use client";

import { AlertCircle, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SinergiDTO } from "@/features/sinergi/domain/sinergi";
import { idleActionState } from "@/lib/action-state";

import { hapusSinergiAction } from "../actions";
import { SinergiFormDialog } from "./sinergi-form-dialog";

interface SinergiRowActionsProps {
  item: SinergiDTO;
  canEdit: boolean;
  canDelete: boolean;
  tahunAwal: number;
}

export function SinergiRowActions({ item, canEdit, canDelete, tahunAwal }: SinergiRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(item.id));
      const result = await hapusSinergiAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus program sinergi.");
    });
  }

  if (!canEdit && !canDelete) return <span className="text-muted-foreground">-</span>;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Aksi program ${item.nama}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit ? (
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Ubah
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Hapus
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <SinergiFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={item}
        tahunAwal={tahunAwal}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus program sinergi?</AlertDialogTitle>
            <AlertDialogDescription>
              Program &quot;{item.nama}&quot; beserta keterangannya akan dihapus dari desa ini.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
