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
import type {
  RumahTanggaListRow,
  RumahTanggaReferenceData,
} from "@/features/rumah-tangga/domain/rumah-tangga";
import { idleActionState } from "@/lib/action-state";

import { deleteRumahTanggaAction } from "../actions";
import { RumahTanggaFormDialog } from "./rumah-tangga-form-dialog";
import { RumahTanggaMembersDialog } from "./rumah-tangga-members-dialog";

interface RumahTanggaRowActionsProps {
  rumahTangga: RumahTanggaListRow;
  reference: RumahTanggaReferenceData;
}

/** Menu aksi per baris: anggota, ubah, dan hapus rumah tangga. */
export function RumahTanggaRowActions({ rumahTangga, reference }: RumahTanggaRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", String(rumahTangga.id));

    startTransition(async () => {
      const state = await deleteRumahTanggaAction(idleActionState, formData);
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
          <Button variant="ghost" size="icon" aria-label={`Aksi untuk RTM ${rumahTangga.number}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setMembersOpen(true)}>
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

      <RumahTanggaFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        reference={reference}
        rumahTangga={rumahTangga}
      />

      <RumahTanggaMembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        reference={reference}
        rumahTangga={rumahTangga}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus rumah tangga ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Data rumah tangga <span className="font-medium">{rumahTangga.number}</span> akan
              dihapus. Penduduk yang tercatat di dalamnya tidak ikut terhapus — hanya tautannya yang
              dilepas.
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
