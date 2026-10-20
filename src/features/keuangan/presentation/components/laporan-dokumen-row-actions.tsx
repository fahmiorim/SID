"use client";

import {
  CheckCircle2,
  Download,
  Loader2,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import type { LaporanDokumenRow } from "@/features/keuangan/domain/laporan-dokumen";
import { idleActionState } from "@/lib/action-state";

import { deleteLaporanDokumenAction, setLaporanTerkirimAction } from "../laporan-dokumen-actions";
import { LaporanDokumenFormDialog } from "./laporan-dokumen-form-dialog";

/**
 * Aksi baris dokumen: unduh, tandai terkirim, ganti, hapus.
 *
 * Memakai `useTransition` + pemanggilan aksi langsung (bukan `useActionState`)
 * karena hasilnya memicu dialog/toast, bukan mengisi state formulir.
 */
export function LaporanDokumenRowActions({
  laporan,
  tahunDefault,
}: {
  laporan: LaporanDokumenRow;
  tahunDefault: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleKirim() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(laporan.id));
      formData.set("terkirim", laporan.terkirim ? "false" : "true");

      const result = await setLaporanTerkirimAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        return;
      }
      toast.error(result.status === "error" ? result.message : "Gagal memperbarui status kirim.");
    });
  }

  function handleHapus() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(laporan.id));

      const result = await deleteLaporanDokumenAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setHapusOpen(false);
        return;
      }
      toast.error(result.status === "error" ? result.message : "Gagal menghapus dokumen.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Aksi dokumen ${laporan.judul}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a
              href={`/keuangan/laporan-dokumen/${laporan.id}/berkas`}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="size-4" />
              Unduh berkas
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleKirim} disabled={isPending}>
            {laporan.terkirim ? (
              <>
                <CheckCircle2 className="size-4" />
                Batalkan tanda kirim
              </>
            ) : (
              <>
                <Send className="size-4" />
                Tandai terkirim
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Ganti dokumen
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setHapusOpen(true)}>
            <Trash2 className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LaporanDokumenFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        laporan={laporan}
        tahunDefault={tahunDefault}
      />

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dokumen laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen &ldquo;{laporan.judul}&rdquo; ({laporan.semesterLabel} {laporan.tahun})
              beserta berkasnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={handleHapus} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
