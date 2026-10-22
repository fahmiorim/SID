"use client";

import { AlertCircle, ImagePlus, Loader2, Pencil, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { AlbumAdminRow, FotoAdminRow } from "@/features/konten/domain/galeri";
import { urlMedia } from "@/features/publik/domain/format";
import { idleActionState } from "@/lib/action-state";

import { hapusFotoAction, simpanFotoAction, unggahFotoAction } from "../galeri-actions";

interface GaleriDetailManagerProps {
  album: AlbumAdminRow;
  foto: FotoAdminRow[];
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

/** Form unggah beberapa foto sekaligus. */
function UnggahFotoForm({ albumId }: { albumId: number }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(unggahFotoAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="albumId" value={albumId} />

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="foto">Pilih foto</Label>
          <Input
            id="foto"
            name="foto"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          />
          <p className="text-xs text-muted-foreground">
            Bisa beberapa berkas sekaligus (maksimal 20). JPG, PNG, WEBP, GIF, atau SVG.
          </p>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <ImagePlus className="size-4" />}
          Unggah
        </Button>
      </div>
    </form>
  );
}

/** Dialog ubah metadata satu foto. */
function FotoEditDialog({
  open,
  onOpenChange,
  albumId,
  foto,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albumId: number;
  foto?: FotoAdminRow | null;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(simpanFotoAction, idleActionState);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ubah Foto</DialogTitle>
          <DialogDescription>
            Atur judul, keterangan, urutan, dan penempatan foto.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={foto?.id ?? ""} />
          <input type="hidden" name="albumId" value={albumId} />

          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal
            <img
              src={urlMedia(foto.gambar) ?? ""}
              alt={foto.judul ?? "Foto galeri"}
              className="h-40 w-full rounded-lg border object-cover"
            />
          ) : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              defaultValue={foto?.judul ?? ""}
              maxLength={150}
              aria-invalid={Boolean(fieldErrors?.judul)}
            />
            <FieldError messages={fieldErrors?.judul} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={foto?.keterangan ?? ""}
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
                max={9999}
                defaultValue={foto?.urut ?? 0}
                aria-invalid={Boolean(fieldErrors?.urut)}
              />
              <FieldError messages={fieldErrors?.urut} />
            </div>

            <div className="space-y-2 self-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="aktif" defaultChecked={foto?.aktif ?? true} />
                Tampilkan
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="slider" defaultChecked={foto?.slider ?? false} />
                Pakai sebagai slider beranda
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Simpan perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Unggah + kelola foto dalam satu album. */
export function GaleriDetailManager({ album, foto, canManage }: GaleriDetailManagerProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<FotoAdminRow | null>(null);
  const [confirm, setConfirm] = useState<FotoAdminRow | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaUbah(row: FotoAdminRow) {
    setEditing(row);
    setEditOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));
    formData.set("albumId", String(album.id));

    startTransition(async () => {
      const state = await hapusFotoAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirm(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {canManage ? (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-medium">Tambah Foto</h2>
          <UnggahFotoForm albumId={album.id} />
        </div>
      ) : null}

      {foto.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Belum ada foto di album ini.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foto.map((row) => (
            <li key={row.id} className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal */}
              <img
                src={urlMedia(row.gambar) ?? ""}
                alt={row.judul ?? "Foto galeri"}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="line-clamp-1 text-sm font-medium">
                    {row.judul || "Tanpa judul"}
                  </span>
                  {!row.aktif ? (
                    <Badge variant="secondary" className="text-xs">
                      Nonaktif
                    </Badge>
                  ) : null}
                  {row.slider ? (
                    <Badge variant="outline" className="text-xs">
                      Slider
                    </Badge>
                  ) : null}
                </div>
                {row.keterangan ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{row.keterangan}</p>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Urutan {row.urut}
                  </span>
                  {canManage ? (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Ubah foto"
                        onClick={() => bukaUbah(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Hapus foto"
                        onClick={() => {
                          setDeleteState(idleActionState);
                          setConfirm(row);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FotoEditDialog
        key={editing?.id ?? "foto"}
        open={editOpen}
        onOpenChange={setEditOpen}
        albumId={album.id}
        foto={editing}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus foto ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Foto {confirm?.judul ? `“${confirm.judul}”` : "ini"} dan berkasnya akan dihapus
              permanen.
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
