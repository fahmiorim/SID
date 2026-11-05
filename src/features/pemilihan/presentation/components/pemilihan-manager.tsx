"use client";

import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createIdleActionState } from "@/lib/action-state";

import type { PemilihanDTO } from "../../domain/pemilihan";
import { hapusPemilihanAction, simpanPemilihanAction } from "../pemilihan-actions";
import { KandidatDialog } from "./kandidat-dialog";

function formatTanggal(value: string | null) {
  if (!value) return "—";
  const tanggal = new Date(value);
  return Number.isNaN(tanggal.getTime()) ? value : tanggal.toLocaleDateString("id-ID");
}

function HapusPemilihanButton({ item }: { item: PemilihanDTO }) {
  const [state, formAction, isPending] = useActionState(
    hapusPemilihanAction,
    createIdleActionState<{ id: number } | null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={item.id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        aria-label={`Hapus pemilihan ${item.jenis} ${item.tahun}`}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </form>
  );
}

export function PemilihanManager({
  items,
  canWrite,
  canManage,
}: {
  items: PemilihanDTO[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PemilihanDTO | null>(null);
  const [kandidatItem, setKandidatItem] = useState<PemilihanDTO | null>(null);
  const [state, formAction, isPending] = useActionState(
    simpanPemilihanAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      startTransition(() => {
        setDialogOpen(false);
        setEditing(null);
      });
    }
  }, [state]);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(item: PemilihanDTO) {
    setEditing(item);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Daftar Pemilihan</CardTitle>
        {canWrite ? (
          <Button size="sm" onClick={bukaTambah}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pemilihan
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada pemilihan yang terdaftar untuk desa ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tahun</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Jenis</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Tanggal
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Keterangan
                  </th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.tahun}</td>
                    <td className="p-3">{item.jenis}</td>
                    <td className="p-3">{formatTanggal(item.tanggal)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.keterangan || "—"}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setKandidatItem(item)}
                          aria-label={`Kandidat pemilihan ${item.jenis} ${item.tahun}`}
                        >
                          <Users className="h-4 w-4" />
                          Kandidat
                        </Button>
                        {canWrite ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => bukaUbah(item)}
                            aria-label={`Ubah pemilihan ${item.jenis} ${item.tahun}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {canManage ? <HapusPemilihanButton item={item} /> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <KandidatDialog
        open={kandidatItem !== null}
        onOpenChange={(next) => {
          if (!next) setKandidatItem(null);
        }}
        pemilihan={kandidatItem}
        canWrite={canWrite}
        canManage={canManage}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Pemilihan" : "Tambah Pemilihan"}</DialogTitle>
            <DialogDescription>
              Catat penyelenggaraan pemilihan desa beserta tahun dan tanggalnya.
            </DialogDescription>
          </DialogHeader>

          <form key={editing?.id ?? "baru"} action={formAction} className="space-y-4">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

            {state.status === "error" ? (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                min={2000}
                max={2100}
                defaultValue={editing?.tahun ?? new Date().getFullYear()}
                required
              />
              {fieldErrors?.tahun ? (
                <p className="text-sm text-destructive">{fieldErrors.tahun[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis</Label>
              <Input
                id="jenis"
                name="jenis"
                placeholder="Pemilihan Kepala Desa"
                defaultValue={editing?.jenis ?? ""}
                maxLength={50}
                required
              />
              {fieldErrors?.jenis ? (
                <p className="text-sm text-destructive">{fieldErrors.jenis[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={editing?.tanggal ?? ""}
              />
              {fieldErrors?.tanggal ? (
                <p className="text-sm text-destructive">{fieldErrors.tanggal[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                defaultValue={editing?.keterangan ?? ""}
              />
              {fieldErrors?.keterangan ? (
                <p className="text-sm text-destructive">{fieldErrors.keterangan[0]}</p>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
