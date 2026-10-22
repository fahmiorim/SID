"use client";

import { AlertCircle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JabatanAdminRow } from "@/features/konten/domain/perangkat";
import { idleActionState } from "@/lib/action-state";

import { hapusJabatanAction, simpanJabatanAction } from "../perangkat-actions";

interface JabatanManagerProps {
  jabatan: JabatanAdminRow[];
  canManage: boolean;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

/** Dialog tambah/ubah jabatan. */
function JabatanFormDialog({
  open,
  onOpenChange,
  jabatan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jabatan?: JabatanAdminRow | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(jabatan);
  const [state, formAction, isPending] = useActionState(simpanJabatanAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Jabatan" : "Tambah Jabatan"}</DialogTitle>
          <DialogDescription>
            Jabatan dipakai untuk menyusun SOTK dan memilih penanda tangan surat.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {jabatan ? <input type="hidden" name="id" value={jabatan.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Jabatan</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={jabatan?.nama ?? ""}
              maxLength={100}
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urut">Urutan</Label>
            <Input
              id="urut"
              name="urut"
              type="number"
              min={0}
              max={999}
              defaultValue={jabatan?.urut ?? 0}
              aria-invalid={Boolean(fieldErrors?.urut)}
            />
            <FieldError messages={fieldErrors?.urut} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Daftar jabatan + aksi kelola. */
export function JabatanManager({ jabatan, canManage }: JabatanManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JabatanAdminRow | null>(null);
  const [confirm, setConfirm] = useState<JabatanAdminRow | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: JabatanAdminRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusJabatanAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirm(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {jabatan.length === 0 ? "Belum ada jabatan." : `${jabatan.length} jabatan terdaftar.`}
        </p>
        {canManage ? (
          <Button type="button" variant="outline" onClick={bukaTambah}>
            <Plus className="size-4" />
            Tambah Jabatan
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Jabatan</TableHead>
              <TableHead className="w-36">Slug</TableHead>
              <TableHead className="w-24">Urut</TableHead>
              <TableHead className="w-32">Perangkat</TableHead>
              {canManage ? <TableHead className="w-24 text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jabatan.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">
                    Tambahkan jabatan seperti Kepala Desa, Sekretaris, atau Kaur.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              jabatan.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell>
                    <code className="text-xs">{row.slug}</code>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.urut}</TableCell>
                  <TableCell className="tabular-nums">{row.jumlahPerangkat}</TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Ubah jabatan ${row.nama}`}
                          onClick={() => bukaUbah(row)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus jabatan ${row.nama}`}
                          onClick={() => {
                            setDeleteState(idleActionState);
                            setConfirm(row);
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <JabatanFormDialog
        key={editing?.id ?? "baru"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jabatan={editing}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus jabatan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Jabatan &ldquo;{confirm?.nama}&rdquo; akan dihapus.
              {confirm && confirm.jumlahPerangkat > 0
                ? ` ${confirm.jumlahPerangkat} perangkat yang menjabat akan menjadi tanpa jabatan.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteState.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{deleteState.message}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <Button variant="destructive" onClick={hapus} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
