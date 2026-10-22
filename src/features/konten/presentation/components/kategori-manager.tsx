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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { KategoriBeritaRow } from "@/features/konten/domain/berita";
import { idleActionState } from "@/lib/action-state";

import { hapusKategoriAction, simpanKategoriAction } from "../actions";

interface KategoriManagerProps {
  kategori: KategoriBeritaRow[];
  canManage: boolean;
}

/** Tampilkan pesan kesalahan milik satu field. */
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

/** Form tambah/ubah kategori di dalam dialog. */
function KategoriFormDialog({
  open,
  onOpenChange,
  kategori,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategori?: KategoriBeritaRow | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(kategori);
  const [state, formAction, isPending] = useActionState(simpanKategoriAction, idleActionState);
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
            Kategori dipakai untuk mengelompokkan berita dan menyaring daftar di situs publik.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {kategori ? <input type="hidden" name="id" value={kategori.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kategori</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={kategori?.nama ?? ""}
              maxLength={100}
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="urut">Urutan</Label>
              <Input
                id="urut"
                name="urut"
                type="number"
                min={0}
                max={999}
                defaultValue={kategori?.urut ?? 0}
                aria-invalid={Boolean(fieldErrors?.urut)}
              />
              <FieldError messages={fieldErrors?.urut} />
            </div>

            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox name="aktif" defaultChecked={kategori?.aktif ?? true} />
              Aktif
            </label>
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

/** Daftar kategori + aksi tambah/ubah/hapus untuk halaman admin. */
export function KategoriManager({ kategori, canManage }: KategoriManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KategoriBeritaRow | null>(null);
  const [confirm, setConfirm] = useState<KategoriBeritaRow | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: KategoriBeritaRow) {
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
        {canManage ? (
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
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-24">Urutan</TableHead>
              <TableHead className="w-28">Status</TableHead>
              {canManage ? <TableHead className="w-28 text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {kategori.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">
                    Tambahkan kategori agar berita mudah dikelompokkan.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              kategori.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell>
                    <code className="text-xs">{row.slug}</code>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.urut}</TableCell>
                  <TableCell>
                    <Badge variant={row.aktif ? "default" : "secondary"} className="text-xs">
                      {row.aktif ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Ubah kategori ${row.nama}`}
                          onClick={() => bukaUbah(row)}
                        >
                          <Pencil className="size-4" />
                        </Button>
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
        kategori={editing}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori &ldquo;{confirm?.nama}&rdquo; akan dihapus. Berita yang memakainya tetap ada,
              tetapi menjadi tanpa kategori.
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
