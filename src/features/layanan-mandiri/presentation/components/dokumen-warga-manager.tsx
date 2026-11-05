"use client";
"use client";

import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { createIdleActionState } from "@/lib/action-state";

import {
  bisaDiubahWarga,
  JENIS_DOKUMEN_WARGA,
  KODE_JENIS_DOKUMEN,
  labelJenisDokumen,
  labelSumberDokumen,
  type DokumenWargaDTO,
} from "../../domain/dokumen-warga";
import {
  hapusDokumenWargaAction,
  ubahDokumenWargaAction,
  unggahDokumenWargaAction,
} from "../dokumen-warga-actions";

function HapusDokumenDialog({ item }: { item: DokumenWargaDTO }) {
  const [terbuka, setTerbuka] = useState(false);
  const [state, formAction, isPending] = useActionState(
    hapusDokumenWargaAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={terbuka && state.status !== "success"} onOpenChange={setTerbuka}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Hapus ${item.nama}`}
        onClick={() => setTerbuka(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus dokumen?</DialogTitle>
          <DialogDescription>
            Dokumen “{item.nama}” beserta berkasnya akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={item.id} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Hapus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DokumenWargaFormDialog({
  terbuka,
  onOpenChange,
  item,
}: {
  terbuka: boolean;
  onOpenChange: (open: boolean) => void;
  item: DokumenWargaDTO | null;
}) {
  const ubah = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    ubah ? ubahDokumenWargaAction : unggahDokumenWargaAction,
    createIdleActionState<null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={terbuka} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ubah ? "Ubah dokumen" : "Unggah dokumen"}</DialogTitle>
          <DialogDescription>
            {ubah
              ? "Perbarui jenis dan nama dokumen. Untuk mengganti berkas, hapus lalu unggah ulang."
              : "Berkas disimpan privat dan hanya dapat diunduh oleh akun Anda."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis dokumen</Label>
            <select
              id="jenis"
              name="jenis"
              defaultValue={item?.jenis ?? "ktp"}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              {KODE_JENIS_DOKUMEN.map((kode) => (
                <option key={kode} value={kode}>
                  {JENIS_DOKUMEN_WARGA[kode]}
                </option>
              ))}
            </select>
            {fieldErrors?.jenis ? (
              <p className="text-sm text-destructive">{fieldErrors.jenis[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama dokumen</Label>
            <Input
              id="nama"
              name="nama"
              maxLength={200}
              placeholder="Mis. KTP Kepala Keluarga"
              defaultValue={item?.nama ?? ""}
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          {ubah ? null : (
            <div className="space-y-2">
              <Label htmlFor="berkas">Berkas (JPG, PNG, WEBP, atau PDF)</Label>
              <Input
                id="berkas"
                name="berkas"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
              />
              {fieldErrors?.berkas ? (
                <p className="text-sm text-destructive">{fieldErrors.berkas[0]}</p>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Daftar + aksi arsip dokumen pribadi warga. */
export function DokumenWargaManager({ dokumen }: { dokumen: DokumenWargaDTO[] }) {
  const [dialogTerbuka, setDialogTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState<DokumenWargaDTO | null>(null);

  const bukaTambah = () => {
    setDipilih(null);
    setDialogTerbuka(true);
  };

  const bukaUbah = (item: DokumenWargaDTO) => {
    setDipilih(item);
    setDialogTerbuka(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Simpan KTP, KK, akta, dan dokumen penting lain. Hanya Anda yang dapat mengunduhnya.
        </p>
        <Button size="sm" onClick={bukaTambah}>
          <Plus className="mr-1 size-4" />
          Unggah dokumen
        </Button>
      </div>

      {dokumen.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada dokumen. Unggah dokumen pertama Anda.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {dokumen.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="truncate">{item.nama}</span>
                  <Badge variant="outline">{labelJenisDokumen(item.jenis)}</Badge>
                  <Badge variant={bisaDiubahWarga(item) ? "secondary" : "outline"}>
                    {labelSumberDokumen(item.sumber)}
                  </Badge>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.namaAsli} ·{" "}
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "—"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`/layanan-mandiri/dokumen/${item.id}/berkas`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Unduh ${item.nama}`}
                  >
                    <Eye className="size-4" />
                  </a>
                </Button>
                {bisaDiubahWarga(item) ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Ubah ${item.nama}`}
                      onClick={() => bukaUbah(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <HapusDokumenDialog item={item} />
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <DokumenWargaFormDialog
        terbuka={dialogTerbuka}
        onOpenChange={setDialogTerbuka}
        item={dipilih}
      />
    </div>
  );
}
