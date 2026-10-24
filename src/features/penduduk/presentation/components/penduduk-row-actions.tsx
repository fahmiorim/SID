"use client";

import {
  AlertCircle,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
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
import {
  pendudukLabel,
  type PendudukListRow,
  type PendudukReferenceData,
} from "@/features/penduduk/domain/penduduk";
import type { KredensialWarga, WargaAccountSummary } from "@/features/warga/domain/warga";
import { buatAkunWargaAction, resetPinWargaAction } from "@/features/warga/presentation/actions";
import { KredensialWargaDialog } from "@/features/warga/presentation/components/kredensial-warga-dialog";
import { idleActionState } from "@/lib/action-state";

import { deletePendudukAction } from "../actions";
import { PendudukFormDialog } from "./penduduk-form-dialog";

interface PendudukRowActionsProps {
  penduduk: PendudukListRow;
  reference: PendudukReferenceData;
  /** Akun warga yang sudah ada, atau `null` bila belum dibuat. */
  akunWarga: WargaAccountSummary | null;
}

/** Menu aksi per baris: akun warga, ubah, & hapus (dengan konfirmasi). */
export function PendudukRowActions({ penduduk, reference, akunWarga }: PendudukRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [kredensial, setKredensial] = useState<KredensialWarga | null>(null);
  const [kredensialOpen, setKredensialOpen] = useState(false);
  const [kredensialJudul, setKredensialJudul] = useState("Akun warga");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const label = pendudukLabel(penduduk);

  /** Buat akun atau reset PIN, lalu tampilkan PIN sekali pada dialog. */
  function handleAkunWarga(mode: "buat" | "reset") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("residentId", String(penduduk.id));

      const result =
        mode === "buat"
          ? await buatAkunWargaAction(idleActionState, formData)
          : await resetPinWargaAction(idleActionState, formData);

      if (result.status === "success") {
        setKredensial(result.data);
        setKredensialJudul(mode === "buat" ? "Akun warga dibuat" : "PIN warga direset");
        setKredensialOpen(true);
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.status === "error" ? result.message : "Gagal memproses akun warga.");
    });
  }

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
          {akunWarga ? (
            <DropdownMenuItem disabled={isPending} onSelect={() => handleAkunWarga("reset")}>
              <KeyRound className="size-4" />
              Reset PIN warga
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={isPending} onSelect={() => handleAkunWarga("buat")}>
              <UserPlus className="size-4" />
              Buat akun warga
            </DropdownMenuItem>
          )}
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

      <KredensialWargaDialog
        open={kredensialOpen}
        onOpenChange={setKredensialOpen}
        kredensial={kredensial}
        judul={kredensialJudul}
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
