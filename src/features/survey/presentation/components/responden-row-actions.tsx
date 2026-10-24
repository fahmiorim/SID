"use client";

import { AlertCircle, Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RespondenRow } from "@/features/survey/domain/survey";
import { idleActionState } from "@/lib/action-state";

import { hapusRespondenAction, loadJawabanRespondenAction } from "../actions";

interface RespondenRowActionsProps {
  surveyId: number;
  responden: RespondenRow;
  canDelete: boolean;
}

type DetailState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      data: Awaited<ReturnType<typeof loadJawabanRespondenAction>>;
    };

export function RespondenRowActions({ surveyId, responden, canDelete }: RespondenRowActionsProps) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<DetailState>({ status: "idle" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function bukaDetail() {
    setDetailOpen(true);
    setDetail({ status: "loading" });

    startTransition(async () => {
      const hasil = await loadJawabanRespondenAction(surveyId, responden.id);
      setDetail({ status: "ready", data: hasil });
    });
  }

  function handleDelete() {
    setError(null);
    startDelete(async () => {
      const formData = new FormData();
      formData.set("surveyId", String(surveyId));
      formData.set("id", String(responden.id));
      const result = await hapusRespondenAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menghapus responden.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Aksi responden ${responden.nama}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={bukaDetail}>
            <Eye className="size-4" />
            Lihat jawaban
          </DropdownMenuItem>
          {canDelete ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Hapus
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Jawaban {responden.nama ?? "Responden"}</DialogTitle>
            <DialogDescription>
              {responden.nik ? `NIK ${responden.nik}` : "Tanpa NIK"} · {responden.jumlahJawaban}{" "}
              jawaban tersimpan
            </DialogDescription>
          </DialogHeader>

          {detail.status === "loading" || isPending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Memuat jawaban...
            </p>
          ) : detail.status === "ready" && detail.data.ok ? (
            <dl className="divide-y">
              {detail.data.data.jawaban.map((item) => (
                <div key={item.soalId} className="space-y-1 py-3">
                  <dt className="text-sm font-medium">{item.pertanyaan}</dt>
                  <dd className="text-sm text-muted-foreground">{item.jawaban || "—"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-destructive">
              {detail.status === "ready" && !detail.data.ok
                ? detail.data.message
                : "Gagal memuat jawaban."}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus responden?</AlertDialogTitle>
            <AlertDialogDescription>
              Jawaban dari &quot;{responden.nama ?? "responden"}&quot; akan dihapus dari rekap.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
