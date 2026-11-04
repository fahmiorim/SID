"use client";

import { AlertCircle, Loader2, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
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
import type { KlasifikasiSuratDTO, SuratKeluarDTO } from "@/features/surat/domain/surat";
import { createIdleActionState, idleActionState } from "@/lib/action-state";

import { deleteSuratKeluarAction, tambahEkspedisiSuratKeluarAction } from "../agenda-actions";
import { SuratKeluarFormDialog } from "./surat-keluar-form-dialog";

interface SuratKeluarRowActionsProps {
  surat: SuratKeluarDTO;
  classifications: KlasifikasiSuratDTO[];
}

export function SuratKeluarRowActions({ surat, classifications }: SuratKeluarRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ekspedisiOpen, setEkspedisiOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ekspedisiState, ekspedisiAction, ekspedisiPending] = useActionState(
    tambahEkspedisiSuratKeluarAction,
    createIdleActionState(),
  );

  if (ekspedisiState.status === "success") {
    toast.success(ekspedisiState.message);
  }
  if (ekspedisiState.status === "error") {
    toast.error(ekspedisiState.message);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      const result = await deleteSuratKeluarAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus surat keluar.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Aksi surat keluar ${surat.letterNumber}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEkspedisiOpen(true)}>
            <Send className="size-4" />
            Ekspedisi
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

      <SuratKeluarFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        classifications={classifications}
        surat={surat}
      />

      <AlertDialog open={ekspedisiOpen} onOpenChange={setEkspedisiOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Catat ekspedisi surat keluar</AlertDialogTitle>
            <AlertDialogDescription>Tambahkan data pengiriman surat keluar.</AlertDialogDescription>
          </AlertDialogHeader>
          <form action={ekspedisiAction} className="space-y-3">
            <input type="hidden" name="outgoingLetterId" value={surat.id} />
            <div className="space-y-2">
              <Label htmlFor={`tgl-kirim-${surat.id}`}>Tanggal kirim</Label>
              <Input id={`tgl-kirim-${surat.id}`} name="sentDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`tujuan-${surat.id}`}>Tujuan/Penerima</Label>
              <Input id={`tujuan-${surat.id}`} name="recipient" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cara-${surat.id}`}>Cara kirim</Label>
              <Input id={`cara-${surat.id}`} name="deliveryMethod" placeholder="Kurir/Pos/Email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`resi-${surat.id}`}>No. Resi/Referensi</Label>
              <Input id={`resi-${surat.id}`} name="trackingNo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`catatan-keluar-${surat.id}`}>Catatan</Label>
              <Input id={`catatan-keluar-${surat.id}`} name="note" />
            </div>
            {ekspedisiState.status === "error" ? (
              <Alert variant="destructive">
                <AlertDescription>{ekspedisiState.message}</AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={ekspedisiPending}>
                Batal
              </AlertDialogCancel>
              <Button type="submit" disabled={ekspedisiPending}>
                {ekspedisiPending ? <Loader2 className="animate-spin" /> : null}
                Simpan ekspedisi
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus surat keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan agenda surat keluar akan dihapus permanen.
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
