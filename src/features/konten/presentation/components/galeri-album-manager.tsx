"use client";

import { AlertCircle, Images, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import type { AlbumAdminRow } from "@/features/konten/domain/galeri";
import { urlMedia } from "@/features/publik/domain/format";
import { idleActionState } from "@/lib/action-state";

import { hapusAlbumAction, simpanAlbumAction } from "../galeri-actions";

interface GaleriAlbumManagerProps {
  album: AlbumAdminRow[];
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

/** Dialog tambah/ubah album. */
function AlbumFormDialog({
  open,
  onOpenChange,
  album,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album?: AlbumAdminRow | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(album);
  const [state, formAction, isPending] = useActionState(simpanAlbumAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const sampul = urlMedia(album?.sampul);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Album" : "Tambah Album"}</DialogTitle>
          <DialogDescription>
            Album mengelompokkan foto. Foto bertanda slider dapat dipakai sebagai sorotan beranda.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {album ? <input type="hidden" name="id" value={album.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Album</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={album?.nama ?? ""}
              maxLength={150}
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={album?.keterangan ?? ""}
              maxLength={2000}
              rows={3}
              aria-invalid={Boolean(fieldErrors?.keterangan)}
            />
            <FieldError messages={fieldErrors?.keterangan} />
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
                defaultValue={album?.urut ?? 0}
                aria-invalid={Boolean(fieldErrors?.urut)}
              />
              <FieldError messages={fieldErrors?.urut} />
            </div>

            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox name="aktif" defaultChecked={album?.aktif ?? true} />
              Tampilkan di situs publik
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampul">Sampul</Label>
            {sampul ? (
              // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal
              <img
                src={sampul}
                alt="Sampul album saat ini"
                className="h-24 w-40 rounded-lg border object-cover"
              />
            ) : null}
            <Input
              id="sampul"
              name="sampul"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              aria-invalid={Boolean(fieldErrors?.sampul)}
            />
            <p className="text-xs text-muted-foreground">
              {sampul
                ? "Pilih berkas baru untuk mengganti sampul."
                : "Opsional; JPG, PNG, WEBP, GIF, atau SVG."}
            </p>
            <FieldError messages={fieldErrors?.sampul} />
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

/** Daftar album + aksi kelola untuk halaman admin. */
export function GaleriAlbumManager({ album, canManage }: GaleriAlbumManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AlbumAdminRow | null>(null);
  const [confirm, setConfirm] = useState<AlbumAdminRow | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: AlbumAdminRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusAlbumAction(idleActionState, formData);
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
          {album.length === 0 ? "Belum ada album." : `${album.length} album terdaftar.`}
        </p>
        {canManage ? (
          <Button type="button" onClick={bukaTambah}>
            <Plus className="size-4" />
            Tambah Album
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Sampul</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="w-24">Foto</TableHead>
              <TableHead className="w-28">Status</TableHead>
              {canManage ? <TableHead className="w-44 text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {album.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} className="h-28 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Images className="size-5" />
                    <p className="text-sm">
                      Buat album pertama untuk mengunggah foto kegiatan desa.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              album.map((row) => {
                const sampul = urlMedia(row.sampul);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      {sampul ? (
                        // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal
                        <img
                          src={sampul}
                          alt={`Sampul ${row.nama}`}
                          className="size-12 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <Images className="size-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.nama}</div>
                      <p className="text-xs text-muted-foreground">
                        <code>{row.slug}</code>
                      </p>
                      {row.keterangan ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {row.keterangan}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="tabular-nums">{row.jumlahFoto}</TableCell>
                    <TableCell>
                      <Badge variant={row.aktif ? "default" : "secondary"} className="text-xs">
                        {row.aktif ? "Tampil" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/konten/galeri/${row.id}`}>Kelola</Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Ubah album ${row.nama}`}
                            onClick={() => bukaUbah(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus album ${row.nama}`}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlbumFormDialog
        key={editing?.id ?? "baru"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        album={editing}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus album ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Album &ldquo;{confirm?.nama}&rdquo; beserta {confirm?.jumlahFoto ?? 0} foto dan
              berkasnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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
