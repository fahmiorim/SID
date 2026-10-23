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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  INVENTARIS_KATEGORI,
  INVENTARIS_KATEGORI_LABELS,
  type InventarisKategoriRow,
} from "@/features/inventaris/domain/inventaris";
import { idleActionState } from "@/lib/action-state";

import { hapusKategoriAction, saveKategoriAction } from "../actions";

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

function KategoriFormDialog({
  open,
  onOpenChange,
  row,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row?: InventarisKategoriRow | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(row);
  const [state, formAction, isPending] = useActionState(saveKategoriAction, idleActionState);
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
          <DialogTitle>{isEdit ? "Ubah Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            Kategori mengelompokkan aset berdasarkan golongan inventaris desa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {row ? <input type="hidden" name="id" value={row.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode</Label>
              <Input
                id="kode"
                name="kode"
                defaultValue={row?.kode ?? ""}
                maxLength={20}
                placeholder="Contoh: INV-01"
                aria-invalid={Boolean(fieldErrors?.kode)}
              />
              <FieldError messages={fieldErrors?.kode} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama">Nama Kategori</Label>
              <Input
                id="nama"
                name="nama"
                defaultValue={row?.nama ?? ""}
                maxLength={150}
                aria-invalid={Boolean(fieldErrors?.nama)}
              />
              <FieldError messages={fieldErrors?.nama} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="golongan">Golongan</Label>
            <Select name="golongan" defaultValue={row?.golongan ?? "tanah"}>
              <SelectTrigger id="golongan" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTARIS_KATEGORI.map((golongan) => (
                  <SelectItem key={golongan} value={golongan}>
                    {INVENTARIS_KATEGORI_LABELS[golongan]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={fieldErrors?.golongan} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={row?.keterangan ?? ""}
              rows={3}
              maxLength={500}
            />
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

export function KategoriInventarisManager({
  kategori,
  canWrite,
  canManage,
}: {
  kategori: InventarisKategoriRow[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventarisKategoriRow | null>(null);
  const [confirm, setConfirm] = useState<InventarisKategoriRow | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: InventarisKategoriRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusKategoriAction(idleActionState, formData);
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
          {kategori.length === 0 ? "Belum ada kategori." : `${kategori.length} kategori terdaftar.`}
        </p>
        {canWrite ? (
          <Button type="button" onClick={bukaTambah}>
            <Plus className="size-4" />
            Tambah Kategori
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Golongan</TableHead>
              <TableHead>Keterangan</TableHead>
              {canWrite || canManage ? <TableHead className="text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {kategori.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite || canManage ? 5 : 4}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tambahkan kategori untuk mengelompokkan barang inventaris.
                </TableCell>
              </TableRow>
            ) : (
              kategori.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <code className="text-xs">{row.kode}</code>
                  </TableCell>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell>{INVENTARIS_KATEGORI_LABELS[row.golongan]}</TableCell>
                  <TableCell className="max-w-xs truncate">{row.keterangan || "-"}</TableCell>
                  {canWrite || canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canWrite ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Ubah kategori ${row.nama}`}
                            onClick={() => bukaUbah(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        ) : null}
                        {canManage ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus kategori ${row.nama}`}
                            onClick={() => {
                              setDeleteState(idleActionState);
                              setConfirm(row);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <KategoriFormDialog
        key={editing?.id ?? "baru"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        row={editing}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori &ldquo;{confirm?.nama}&rdquo; hanya dapat dihapus bila tidak dipakai barang
              inventaris.
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
