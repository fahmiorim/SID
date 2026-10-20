"use client";

import {
  AlertCircle,
  Eye,
  FileDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Printer,
  Send,
  Trash2,
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JenisSuratDTO, SuratListRow } from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";

import { deleteSuratAction, issueSuratAction } from "../actions";
import { SuratFormDialog } from "./surat-form-dialog";

interface PendudukOption {
  id: number;
  name: string;
  nationalId: string | null;
}

interface SuratRowActionsProps {
  surat: SuratListRow;
  jenis: JenisSuratDTO[];
  penduduk: PendudukOption[];
  canManage: boolean;
}

export function SuratRowActions({ surat, jenis, penduduk, canManage }: SuratRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDraft = surat.status === "draft";
  const isIssued = surat.status === "issued";

  function handleIssue() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      const result = await issueSuratAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setIssueOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menerbitkan surat.");
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      const result = await deleteSuratAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus surat.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Aksi surat ${surat.typeName}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canManage && isDraft ? (
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Ubah
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem asChild>
            <a href={`/persuratan/surat/${surat.id}/cetak`} target="_blank" rel="noreferrer">
              {isDraft ? <Eye className="size-4" /> : <Printer className="size-4" />}
              {isDraft ? "Pratinjau" : "Cetak"}
            </a>
          </DropdownMenuItem>

          {isIssued ? (
            <DropdownMenuItem asChild>
              <a href={`/persuratan/surat/${surat.id}/pdf`}>
                <FileDown className="size-4" />
                Unduh PDF
              </a>
            </DropdownMenuItem>
          ) : null}

          {canManage && isDraft ? (
            <>
              <DropdownMenuItem onSelect={() => setIssueOpen(true)}>
                <Send className="size-4" />
                Terbitkan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Hapus
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <SuratFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        jenis={jenis}
        penduduk={penduduk}
        surat={surat}
      />

      <AlertDialog open={issueOpen} onOpenChange={setIssueOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terbitkan surat?</AlertDialogTitle>
            <AlertDialogDescription>
              Nomor surat akan dibuat otomatis dan isi surat dikunci. Setelah terbit, surat tidak
              dapat diubah atau dihapus.
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
            <Button type="button" disabled={isPending} onClick={handleIssue}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Terbitkan
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus konsep surat?</AlertDialogTitle>
            <AlertDialogDescription>
              Konsep surat akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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
