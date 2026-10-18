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
import {
  pendudukLabel,
  type PendudukListRow,
  type PendudukReferenceData,
} from "@/features/penduduk/domain/penduduk";
import { idleActionState } from "@/lib/action-state";

import { deletePendudukAction } from "../actions";
import { PendudukFormDialog } from "./penduduk-form-dialog";

interface PendudukRowActionsProps {
  penduduk: PendudukListRow;
  reference: PendudukReferenceData;
}

/** Menu aksi per baris: ubah & hapus (dengan konfirmasi). */
export function PendudukRowActions({ penduduk, reference }: PendudukRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const label = pendudukLabel(penduduk);

  /**
   * Hapus lewat `startTransition` + pemanggilan Server Action langsung, sehingga
   * dialog dapat ditutup setelah hasil diketahui tanpa `useEffect` penutup.
   */
  function handleDelete() {
    setDeleteError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(penduduk.id));

      const result = await deletePendudukAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setDeleteError(result.status === "error" ? result.message : "Gagal menghapus data.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Aksi untuk ${label}`}>
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

      <PendudukFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        reference={reference}
        penduduk={penduduk}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data penduduk?</AlertDialogTitle>
            <AlertDialogDescription>
              Data <strong>{label}</strong> akan dihapus permanen. Tindakan ini tidak dapat
              dibatalkan.
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
