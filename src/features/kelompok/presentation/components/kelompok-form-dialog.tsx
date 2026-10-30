"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import {
  KELOMPOK_TIPE,
  KELOMPOK_TIPE_LABELS,
  type KelompokDTO,
  type KelompokTipe,
} from "@/features/kelompok/domain/kelompok";
import {
  loadReferensiKelompokAction,
  saveKelompokAction,
} from "@/features/kelompok/presentation/actions";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION, type LabelOption } from "@/lib/forms";

interface KelompokFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  kelompok?: KelompokDTO | null;
  /** Tipe bawaan saat menambah dari halaman bertipe tertentu. */
  defaultTipe?: KelompokTipe;
}

/** Tampilkan pesan kesalahan validasi milik satu field. */
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

/**
 * Dialog formulir tambah/ubah kelompok (terkendali).
 *
 * Slug tidak ditampilkan sebagai isian: dibentuk otomatis dari nama saat
 * penyimpanan. Daftar kategori dimuat saat dialog dibuka lalu disaring menurut
 * tipe yang dipilih. Radix membongkar isi dialog saat tertutup sehingga state
 * `useActionState` otomatis bersih setiap kali dialog dibuka.
 */
export function KelompokFormDialog({
  open,
  onOpenChange,
  kelompok,
  defaultTipe = "kelompok",
}: KelompokFormDialogProps) {
  const isEdit = Boolean(kelompok);
  const [state, formAction, isPending] = useActionState(
    saveKelompokAction,
    createIdleActionState(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  const [tipe, setTipe] = useState<KelompokTipe>(
    (kelompok?.type as KelompokTipe | undefined) ?? defaultTipe,
  );
  const [kategori, setKategori] = useState<LabelOption[]>([]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    loadReferensiKelompokAction(null)
      .then((reference) => {
        if (active) setKategori(reference.kategori);
      })
      .catch(() => {
        if (active) setKategori([]);
      });
    return () => {
      active = false;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Kelompok" : "Tambah Kelompok"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data kelompok atau lembaga."
              : "Catat kelompok masyarakat atau lembaga desa baru."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {kelompok ? <input type="hidden" name="id" value={kelompok.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={kelompok?.name ?? ""}
              maxLength={150}
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe</Label>
              <Select
                name="tipe"
                value={tipe}
                onValueChange={(value) => setTipe(value as KelompokTipe)}
              >
                <SelectTrigger id="tipe" className="w-full">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {KELOMPOK_TIPE.map((value) => (
                    <SelectItem key={value} value={value}>
                      {KELOMPOK_TIPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.tipe} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategoriId">Kategori</Label>
              <Select
                name="kategoriId"
                defaultValue={kelompok?.categoryId ? String(kelompok.categoryId) : NO_SELECTION}
                key={`kategori-${tipe}`}
              >
                <SelectTrigger id="kategoriId" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>—</SelectItem>
                  {kategori.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.kategoriId} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode</Label>
              <Input
                id="kode"
                name="kode"
                defaultValue={kelompok?.code ?? ""}
                maxLength={50}
                aria-invalid={Boolean(fieldErrors?.kode)}
              />
              <FieldError messages={fieldErrors?.kode} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorSk">Nomor SK</Label>
              <Input
                id="nomorSk"
                name="nomorSk"
                defaultValue={kelompok?.decreeNumber ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.nomorSk)}
              />
              <FieldError messages={fieldErrors?.nomorSk} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={kelompok?.description ?? ""}
              maxLength={500}
              rows={3}
              aria-invalid={Boolean(fieldErrors?.keterangan)}
            />
            <FieldError messages={fieldErrors?.keterangan} />
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
