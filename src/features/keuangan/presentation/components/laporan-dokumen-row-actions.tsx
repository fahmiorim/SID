"use client";

import { CalendarCheck, Download, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  tanggalUntukInput,
  type LaporanDokumenRow,
} from "@/features/keuangan/domain/laporan-dokumen";
import { idleActionState } from "@/lib/action-state";

import { deleteLaporanDokumenAction, setLaporanDiserahkanAction } from "../laporan-dokumen-actions";
import { LaporanDokumenFormDialog } from "./laporan-dokumen-form-dialog";

/**
 * Aksi baris dokumen: unduh, catat tanggal penyerahan, ganti, hapus.
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
  const [serahOpen, setSerahOpen] = useState(false);
  const [tanggal, setTanggal] = useState(() => tanggalUntukInput(laporan.diserahkanPada));
  const [isPending, startTransition] = useTransition();

  function handleSerahKirim() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(laporan.id));
      formData.set("diserahkanPada", tanggal);

      const result = await setLaporanDiserahkanAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setSerahOpen(false);
        return;
      }
      toast.error(
        result.status === "error" ? result.message : "Gagal memperbarui tanggal penyerahan.",
      );
    });
  }

  function handleKosongkan() {
    setTanggal("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(laporan.id));
      formData.set("diserahkanPada", "");

      const result = await setLaporanDiserahkanAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setSerahOpen(false);
        return;
      }
      toast.error(result.status === "error" ? result.message : "Gagal menghapus tanggal.");
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

          <DropdownMenuItem onSelect={() => setSerahOpen(true)} disabled={isPending}>
            <CalendarCheck className="size-4" />
            Catat penyerahan
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

      <Dialog open={serahOpen} onOpenChange={setSerahOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tanggal Penyerahan</DialogTitle>
            <DialogDescription>
              Catat kapan dokumen &ldquo;{laporan.judul}&rdquo; ({laporan.semesterLabel}{" "}
              {laporan.tahun}) diserahkan. Kosongkan bila belum diserahkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`serah-${laporan.id}`}>Tanggal diserahkan</Label>
            <Input
              id={`serah-${laporan.id}`}
              type="date"
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleKosongkan} disabled={isPending}>
              Kosongkan
            </Button>
            <Button type="button" onClick={handleSerahKirim} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
