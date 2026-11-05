"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
import { createIdleActionState, type ActionState } from "@/lib/action-state";

import type { AnalisisIndikatorDTO, AnalisisKategoriDTO } from "../../domain/analisis";
import {
  hapusIndikatorAnalisisAction,
  hapusKategoriAnalisisAction,
  simpanIndikatorAnalisisAction,
  simpanKategoriAnalisisAction,
} from "../analisis-actions";

type HasilAksi = { id: number } | null;

function TombolHapus({
  id,
  label,
  action,
}: {
  id: number;
  label: string;
  action: (prev: ActionState<HasilAksi>, formData: FormData) => Promise<ActionState<HasilAksi>>;
}) {
  const [state, formAction, isPending] = useActionState(action, createIdleActionState<HasilAksi>());

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        aria-label={`Hapus ${label}`}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </form>
  );
}

function KategoriDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AnalisisKategoriDTO | null;
}) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    simpanKategoriAnalisisAction,
    createIdleActionState<HasilAksi>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>Kategori mengelompokkan indikator analisis desa.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama-kategori">Nama kategori</Label>
            <Input
              id="nama-kategori"
              name="nama"
              defaultValue={item?.nama ?? ""}
              placeholder="Contoh: Pendidikan"
              maxLength={100}
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan-kategori">Keterangan</Label>
            <Textarea
              id="keterangan-kategori"
              name="keterangan"
              rows={3}
              defaultValue={item?.keterangan ?? ""}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}

function IndikatorDialog({
  open,
  onOpenChange,
  item,
  kategori,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AnalisisIndikatorDTO | null;
  kategori: AnalisisKategoriDTO[];
}) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    simpanIndikatorAnalisisAction,
    createIdleActionState<HasilAksi>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Indikator" : "Tambah Indikator"}</DialogTitle>
          <DialogDescription>
            Indikator dipakai untuk menghitung dan mengelompokkan hasil pendataan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="kategori-indikator">Kategori</Label>
            <select
              id="kategori-indikator"
              name="kategoriId"
              defaultValue={item?.kategoriId ? String(item.kategoriId) : ""}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Tanpa kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
            {fieldErrors?.kategoriId ? (
              <p className="text-sm text-destructive">{fieldErrors.kategoriId[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kode-indikator">Kode</Label>
            <Input
              id="kode-indikator"
              name="kode"
              defaultValue={item?.kode ?? ""}
              placeholder="Contoh: PDD-01"
              maxLength={20}
              required
            />
            {fieldErrors?.kode ? (
              <p className="text-sm text-destructive">{fieldErrors.kode[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama-indikator">Nama indikator</Label>
            <Input
              id="nama-indikator"
              name="nama"
              defaultValue={item?.nama ?? ""}
              placeholder="Contoh: Angka partisipasi sekolah"
              maxLength={200}
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bobot-indikator">Bobot (1–100)</Label>
            <Input
              id="bobot-indikator"
              name="bobot"
              type="number"
              min={1}
              max={100}
              step={1}
              defaultValue={item?.bobot ?? 1}
            />
            <p className="text-xs text-muted-foreground">
              Bobot menentukan pengaruh indikator pada skor survei.
            </p>
            {fieldErrors?.bobot ? (
              <p className="text-sm text-destructive">{fieldErrors.bobot[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan-indikator">Keterangan</Label>
            <Textarea
              id="keterangan-indikator"
              name="keterangan"
              rows={3}
              defaultValue={item?.keterangan ?? ""}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}

export function AnalisisManager({
  kategori,
  indikator,
  canWrite,
  canManage,
}: {
  kategori: AnalisisKategoriDTO[];
  indikator: AnalisisIndikatorDTO[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const [kategoriDialog, setKategoriDialog] = useState(false);
  const [kategoriEdit, setKategoriEdit] = useState<AnalisisKategoriDTO | null>(null);
  const [indikatorDialog, setIndikatorDialog] = useState(false);
  const [indikatorEdit, setIndikatorEdit] = useState<AnalisisIndikatorDTO | null>(null);

  const namaKategori = new Map(kategori.map((item) => [item.id, item.nama]));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Kategori</CardTitle>
          {canWrite ? (
            <Button
              size="sm"
              onClick={() => {
                setKategoriEdit(null);
                setKategoriDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {kategori.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada kategori analisis.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Nama
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Keterangan
                    </th>
                    {canWrite || canManage ? (
                      <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                        Aksi
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {kategori.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{item.nama}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {item.keterangan || "—"}
                      </td>
                      {canWrite || canManage ? (
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            {canWrite ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setKategoriEdit(item);
                                  setKategoriDialog(true);
                                }}
                                aria-label={`Ubah kategori ${item.nama}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {canManage ? (
                              <TombolHapus
                                id={item.id}
                                label={`kategori ${item.nama}`}
                                action={hapusKategoriAnalisisAction}
                              />
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Indikator</CardTitle>
          {canWrite ? (
            <Button
              size="sm"
              onClick={() => {
                setIndikatorEdit(null);
                setIndikatorDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Indikator
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {indikator.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada indikator analisis.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Kode
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Nama
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Kategori
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Bobot
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Keterangan
                    </th>
                    {canWrite || canManage ? (
                      <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                        Aksi
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {indikator.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-3 font-mono text-sm">{item.kode}</td>
                      <td className="p-3 font-medium">{item.nama}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {item.kategoriId ? (namaKategori.get(item.kategoriId) ?? "—") : "—"}
                      </td>
                      <td className="p-3 text-sm tabular-nums">{item.bobot}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {item.keterangan || "—"}
                      </td>
                      {canWrite || canManage ? (
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            {canWrite ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIndikatorEdit(item);
                                  setIndikatorDialog(true);
                                }}
                                aria-label={`Ubah indikator ${item.kode}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {canManage ? (
                              <TombolHapus
                                id={item.id}
                                label={`indikator ${item.kode}`}
                                action={hapusIndikatorAnalisisAction}
                              />
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <KategoriDialog
        key={`kategori-${kategoriEdit?.id ?? "baru"}`}
        open={kategoriDialog}
        onOpenChange={setKategoriDialog}
        item={kategoriEdit}
      />
      <IndikatorDialog
        key={`indikator-${indikatorEdit?.id ?? "baru"}`}
        open={indikatorDialog}
        onOpenChange={setIndikatorDialog}
        item={indikatorEdit}
        kategori={kategori}
      />
    </div>
  );
}
