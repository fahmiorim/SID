"use client";

import { AlertCircle, Loader2, Plus } from "lucide-react";
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
import {
  LAPORAN_TIPE_OPTIONS,
  SEMESTER_OPTIONS,
  type LaporanDokumenRow,
  type LaporanTipe,
} from "@/features/keuangan/domain/laporan-dokumen";
import { idleActionState } from "@/lib/action-state";

import { saveLaporanDokumenAction } from "../laporan-dokumen-actions";

interface LaporanDokumenFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ganti; bila kosong → mode unggah baru. */
  laporan?: LaporanDokumenRow | null;
  /** Tahun anggaran bawaan untuk dokumen baru. */
  tahunDefault: number;
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

/**
 * Dialog unggah/ganti dokumen laporan APBDes per semester.
 *
 * Mengganti dokumen berarti menimpa berkas lama, jadi berkas wajib dipilih
 * ulang agar operator sadar dokumennya tergantikan.
 */
export function LaporanDokumenFormDialog({
  open,
  onOpenChange,
  laporan,
  tahunDefault,
}: LaporanDokumenFormDialogProps) {
  const isEdit = Boolean(laporan);
  const [state, formAction, isPending] = useActionState(saveLaporanDokumenAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ganti Dokumen Laporan" : "Unggah Dokumen Laporan"}</DialogTitle>
          <DialogDescription>
            Dokumen laporan resmi (PDF) per semester yang disiapkan untuk diserahkan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {laporan ? <input type="hidden" name="id" value={laporan.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="tipe">Jenis Laporan</Label>
            <Select
              name="tipe"
              defaultValue={laporan?.tipe ?? LAPORAN_TIPE_OPTIONS[0]?.value ?? ""}
            >
              <SelectTrigger id="tipe" className="w-full">
                <SelectValue placeholder="Pilih jenis laporan" />
              </SelectTrigger>
              <SelectContent>
                {LAPORAN_TIPE_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value satisfies LaporanTipe}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={state.status === "error" ? state.fieldErrors?.tipe : undefined} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              defaultValue={laporan?.judul ?? ""}
              placeholder="Laporan APBDes Semester I"
              maxLength={255}
              required
            />
            <FieldError
              messages={state.status === "error" ? state.fieldErrors?.judul : undefined}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun Anggaran</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                min={2000}
                max={2100}
                defaultValue={laporan?.tahun ?? tahunDefault}
                required
              />
              <FieldError
                messages={state.status === "error" ? state.fieldErrors?.tahun : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select name="semester" defaultValue={String(laporan?.semester ?? 1)}>
                <SelectTrigger id="semester" className="w-full">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={String(item.value)}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                messages={state.status === "error" ? state.fieldErrors?.semester : undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="berkas">Berkas Laporan (PDF, maks. 8 MB)</Label>
            <Input id="berkas" name="berkas" type="file" accept="application/pdf,.pdf" required />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Ganti dokumen" : "Unggah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Tombol pembuka dialog unggah dokumen laporan. */
export function LaporanDokumenCreateButton({ tahunDefault }: { tahunDefault: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Unggah Dokumen
      </Button>

      <LaporanDokumenFormDialog
        open={open}
        onOpenChange={setOpen}
        tahunDefault={tahunDefault}
        laporan={null}
      />
    </>
  );
}
