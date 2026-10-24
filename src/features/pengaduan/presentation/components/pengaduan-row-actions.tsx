"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  MessageSquareReply,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { PengaduanRow } from "@/features/pengaduan/domain/pengaduan";
import { idleActionState } from "@/lib/action-state";

import { hapusPengaduanAction, setPublikPengaduanAction } from "../actions";
import { PengaduanDetailDialog } from "./pengaduan-detail-dialog";

interface PengaduanRowActionsProps {
  pengaduan: PengaduanRow;
  canWrite: boolean;
  canDelete: boolean;
}

export function PengaduanRowActions({ pengaduan, canWrite, canDelete }: PengaduanRowActionsProps) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function togglePublik() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(pengaduan.id));
      formData.set("publik", pengaduan.publik ? "0" : "1");
      const result = await setPublikPengaduanAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.status === "error" ? result.message : "Gagal mengubah status publik.");
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(pengaduan.id));
      const result = await hapusPengaduanAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus pengaduan.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Aksi pengaduan ${pengaduan.nomorTiket}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDetailOpen(true)}>
            <MessageSquareReply className="size-4" />
            {canWrite ? "Detail & tanggapi" : "Lihat detail"}
          </DropdownMenuItem>
          {canWrite ? (
            <DropdownMenuItem onSelect={togglePublik} disabled={isPending}>
              {pengaduan.publik ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {pengaduan.publik ? "Sembunyikan dari publik" : "Tampilkan di publik"}
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Hapus
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <PengaduanDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        pengaduan={pengaduan}
        canWrite={canWrite}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengaduan?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pengaduan.judul}&quot; ({pengaduan.nomorTiket}) beserta lampirannya akan
              dihapus permanen.
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
