"use client";

import { AlertCircle, ArrowRightLeft, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { KlasifikasiSuratDTO, SuratMasukDTO } from "@/features/surat/domain/surat";
import { createIdleActionState, idleActionState } from "@/lib/action-state";

import { deleteSuratMasukAction, tambahDisposisiSuratMasukAction } from "../agenda-actions";
import { SuratMasukFormDialog } from "./surat-masuk-form-dialog";

interface SuratMasukRowActionsProps {
  surat: SuratMasukDTO;
  classifications: KlasifikasiSuratDTO[];
}

export function SuratMasukRowActions({ surat, classifications }: SuratMasukRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [disposisiOpen, setDisposisiOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [disposisiState, disposisiAction, disposisiPending] = useActionState(
    tambahDisposisiSuratMasukAction,
    createIdleActionState(),
  );

  if (disposisiState.status === "success") {
    toast.success(disposisiState.message);
  }
  if (disposisiState.status === "error") {
    toast.error(disposisiState.message);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      const result = await deleteSuratMasukAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus surat masuk.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Aksi surat masuk ${surat.letterNumber}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDisposisiOpen(true)}>
            <ArrowRightLeft className="size-4" />
            Disposisi
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Ubah
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SuratMasukFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        classifications={classifications}
        surat={surat}
      />

      <AlertDialog open={disposisiOpen} onOpenChange={setDisposisiOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disposisi surat masuk</AlertDialogTitle>
            <AlertDialogDescription>
              Tambahkan instruksi disposisi untuk surat masuk ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={disposisiAction} className="space-y-3">
            <input type="hidden" name="incomingLetterId" value={surat.id} />
            <div className="space-y-2">
              <Label htmlFor={`instruksi-${surat.id}`}>Instruksi</Label>
              <Textarea id={`instruksi-${surat.id}`} name="instruction" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`kepada-${surat.id}`}>Kepada (peran/pengguna)</Label>
              <Input
                id={`kepada-${surat.id}`}
                name="toRole"
                placeholder="Sekretaris Desa / Kepala Desa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`batas-${surat.id}`}>Batas waktu</Label>
              <Input id={`batas-${surat.id}`} name="dueDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`catatan-${surat.id}`}>Catatan</Label>
              <Input id={`catatan-${surat.id}`} name="note" />
            </div>
            {disposisiState.status === "error" ? (
              <Alert variant="destructive">
                <AlertDescription>{disposisiState.message}</AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={disposisiPending}>
                Batal
              </AlertDialogCancel>
              <Button type="submit" disabled={disposisiPending}>
                {disposisiPending ? <Loader2 className="animate-spin" /> : null}
                Simpan disposisi
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus surat masuk?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan agenda surat masuk akan dihapus permanen.
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
