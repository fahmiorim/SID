"use client";

import { AlertCircle, Loader2, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
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
import type { KelompokListRow } from "@/features/kelompok/domain/kelompok";
import { deleteKelompokAction } from "@/features/kelompok/presentation/actions";
import { idleActionState } from "@/lib/action-state";

import { AnggotaDialog } from "./anggota-dialog";
import { KelompokFormDialog } from "./kelompok-form-dialog";

interface KelompokRowActionsProps {
  kelompok: KelompokListRow;
}

/** Menu aksi per baris: anggota, ubah, dan hapus kelompok. */
export function KelompokRowActions({ kelompok }: KelompokRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [anggotaOpen, setAnggotaOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", String(kelompok.id));

    startTransition(async () => {
      const state = await deleteKelompokAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirmOpen(false);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Aksi untuk ${kelompok.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setAnggotaOpen(true)}>
            <Users className="size-4" />
            Anggota
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Ubah
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <KelompokFormDialog open={editOpen} onOpenChange={setEditOpen} kelompok={kelompok} />

      <AnggotaDialog open={anggotaOpen} onOpenChange={setAnggotaOpen} kelompok={kelompok} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kelompok ini?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{kelompok.name}</span> akan dihapus. Kelompok yang masih
              memiliki anggota tidak dapat dihapus — kosongkan anggotanya terlebih dahulu.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteState.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{deleteState.message}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
