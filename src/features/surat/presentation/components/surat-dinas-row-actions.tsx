"use client";

import { AlertCircle, FileDown, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import type { KlasifikasiSuratDTO, SuratDinasDTO } from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";

import { deleteSuratDinasAction } from "../surat-dinas-actions";
import { SuratDinasFormDialog } from "./surat-dinas-form-dialog";

interface SuratDinasRowActionsProps {
  surat: SuratDinasDTO;
  classifications: KlasifikasiSuratDTO[];
}

export function SuratDinasRowActions({ surat, classifications }: SuratDinasRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      const result = await deleteSuratDinasAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus surat dinas.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Aksi surat dinas ${surat.letterNumber}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Ubah
          </DropdownMenuItem>
          {surat.archiveFile ? (
            <DropdownMenuItem asChild>
              <a
                href={`/api/publik/media/${surat.archiveFile.replace(/^\/+/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <FileDown className="size-4" />
                Buka Arsip
              </a>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SuratDinasFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        classifications={classifications}
        surat={surat}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus surat dinas?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan surat dinas dan lampiran arsipnya akan dihapus permanen.
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
