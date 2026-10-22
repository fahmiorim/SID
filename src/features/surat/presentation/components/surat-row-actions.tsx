"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Printer,
  Send,
  ThumbsDown,
  Trash2,
  UserCheck,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  nextVerificationStep,
  roleCanVerifyStep,
  VERIFICATION_STEP_LABELS,
  type JenisSuratDTO,
  type SuratListRow,
  type VerificationStep,
} from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";

import {
  ajukanVerifikasiSuratAction,
  deleteSuratAction,
  rejectSuratAction,
  verifySuratAction,
} from "../actions";
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
  roleSlug: string | null;
  isSuperadmin: boolean;
}

export function SuratRowActions({
  surat,
  jenis,
  penduduk,
  canManage,
  roleSlug,
  isSuperadmin,
}: SuratRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifyStep, setVerifyStep] = useState<VerificationStep>("operator");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDraft = surat.status === "draft";
  const isWaiting = surat.status === "verifikasi";
  const isIssued = surat.status === "issued";
  const nextStep = nextVerificationStep(surat);
  const canRunNextStep = nextStep !== null && roleCanVerifyStep(nextStep, roleSlug, isSuperadmin);

  function openVerify(step: VerificationStep) {
    setVerifyStep(step);
    setError(null);
    setVerifyOpen(true);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      const result = await ajukanVerifikasiSuratAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setSubmitOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal mengajukan surat.");
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

  function handleVerify() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      formData.set("action", verifyStep);
      const result = await verifySuratAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setVerifyOpen(false);
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal verifikasi surat.");
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(surat.id));
      formData.set("reason", reason);
      const result = await rejectSuratAction(idleActionState, formData);

      if (result.status === "success") {
        toast.success(result.message);
        setRejectOpen(false);
        setReason("");
        return;
      }

      setError(result.status === "error" ? result.message : "Gagal menolak surat.");
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
              {isDraft || isWaiting ? <Eye className="size-4" /> : <Printer className="size-4" />}
              {isDraft || isWaiting ? "Pratinjau" : "Cetak"}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setError(null);
                  setSubmitOpen(true);
                }}
              >
                <Send className="size-4" />
                Ajukan Verifikasi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Hapus
              </DropdownMenuItem>
            </>
          ) : null}

          {canManage && isWaiting && nextStep && canRunNextStep ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => openVerify(nextStep)}>
                {nextStep === "kades" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <UserCheck className="size-4" />
                )}
                Verifikasi {VERIFICATION_STEP_LABELS[nextStep]}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  setError(null);
                  setReason("");
                  setRejectOpen(true);
                }}
              >
                <ThumbsDown className="size-4" />
                Tolak & Kembalikan ke Konsep
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

      <AlertDialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ajukan verifikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Surat masuk antrean verifikasi Operator → Sekretaris Desa → Kepala Desa. Nomor surat
              baru diberikan setelah Kepala Desa menyetujui.
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
            <Button type="button" disabled={isPending} onClick={handleSubmit}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Ajukan
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

      <AlertDialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verifikasi surat</AlertDialogTitle>
            <AlertDialogDescription>
              Setujui tahap {VERIFICATION_STEP_LABELS[verifyStep]} untuk surat ini?
              {verifyStep === "kades"
                ? " Nomor surat akan dibuat dan surat langsung terbit."
                : " Tahap berikutnya adalah " +
                  VERIFICATION_STEP_LABELS[verifyStep === "operator" ? "sekdes" : "kades"] +
                  "."}
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
            <Button type="button" disabled={isPending} onClick={handleVerify}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Verifikasi
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak & kembalikan ke konsep</AlertDialogTitle>
            <AlertDialogDescription>
              Surat dikembalikan menjadi konsep agar bisa diperbaiki. Alasan penolakan wajib diisi.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan penolakan</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Alasan..."
            />
          </div>

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
            <Button
              type="button"
              variant="destructive"
              disabled={isPending || !reason.trim()}
              onClick={handleReject}
            >
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Tolak
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
