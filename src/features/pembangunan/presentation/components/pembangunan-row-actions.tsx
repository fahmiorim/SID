"use client";

import { AlertCircle, Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
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
import type { PembangunanProyekDTO } from "@/features/pembangunan/domain/pembangunan";
import { idleActionState } from "@/lib/action-state";

import { deletePembangunanAction } from "../actions";
import { PembangunanFormDialog } from "./pembangunan-form-dialog";

interface PembangunanRowActionsProps {
  proyek: PembangunanProyekDTO;
}

/** Menu aksi per baris: rincian, ubah, dan hapus proyek. */
export function PembangunanRowActions({ proyek }: PembangunanRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", String(proyek.id));

    startTransition(async () => {
      const state = await deletePembangunanAction(idleActionState, formData);
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
          <Button variant="ghost" size="icon" aria-label={`Aksi untuk proyek ${proyek.judul}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/pembangunan/${proyek.id}`}>
              <Eye className="size-4" />
              Rincian
            </Link>
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

      <PembangunanFormDialog open={editOpen} onOpenChange={setEditOpen} proyek={proyek} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus proyek ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Proyek <span className="font-medium">{proyek.judul}</span> beserta seluruh foto
              dokumentasinya akan dihapus.
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
