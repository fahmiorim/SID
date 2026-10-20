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
import type { PenggunaDTO, RoleOption } from "@/features/pengguna/domain/pengguna";
import { idleActionState } from "@/lib/action-state";

import { deletePenggunaAction } from "../actions";
import { PenggunaFormDialog } from "./pengguna-form-dialog";

interface PenggunaRowActionsProps {
  pengguna: PenggunaDTO;
  roles: RoleOption[];
  isSelf: boolean;
}

export function PenggunaRowActions({ pengguna, roles, isSelf }: PenggunaRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setDeleteError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", pengguna.id);

      const result = await deletePenggunaAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setDeleteError(result.status === "error" ? result.message : "Gagal menghapus pengguna.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Aksi untuk ${pengguna.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Ubah
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf}
            onSelect={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PenggunaFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        roles={roles}
        pengguna={pengguna}
        isSelf={isSelf}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{pengguna.name}</strong> ({pengguna.username}) akan dihapus permanen.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{deleteError}</AlertDescription>
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
