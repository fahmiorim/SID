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
import type { BantuanListRow } from "@/features/bantuan/domain/bantuan";
import { idleActionState } from "@/lib/action-state";

import { deleteBantuanAction } from "../actions";
import { BantuanFormDialog } from "./bantuan-form-dialog";
import { PesertaDialog } from "./peserta-dialog";

interface BantuanRowActionsProps {
  bantuan: BantuanListRow;
}

/** Menu aksi per baris: peserta, ubah, dan hapus program. */
export function BantuanRowActions({ bantuan }: BantuanRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [pesertaOpen, setPesertaOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", String(bantuan.id));

    startTransition(async () => {
      const state = await deleteBantuanAction(idleActionState, formData);
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
          <Button variant="ghost" size="icon" aria-label={`Aksi untuk program ${bantuan.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setPesertaOpen(true)}>
            <Users className="size-4" />
            Peserta
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

      <BantuanFormDialog open={editOpen} onOpenChange={setEditOpen} bantuan={bantuan} />

      <PesertaDialog open={pesertaOpen} onOpenChange={setPesertaOpen} program={bantuan} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus program ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Program <span className="font-medium">{bantuan.name}</span> akan dihapus. Program yang
              masih memiliki peserta tidak dapat dihapus — kosongkan pesertanya terlebih dahulu.
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
