"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import type { SinergiDTO } from "@/features/sinergi/domain/sinergi";
import { createIdleActionState } from "@/lib/action-state";

import { simpanSinergiAction } from "../actions";

interface SinergiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  item?: SinergiDTO | null;
  tahunAwal: number;
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

export function SinergiFormDialog({ open, onOpenChange, item, tahunAwal }: SinergiFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    simpanSinergiAction,
    createIdleActionState<{ id: number } | null>(),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Program Sinergi" : "Tambah Program Sinergi"}</DialogTitle>
          <DialogDescription>
            Catat program lintas pihak beserta mitra, tahun, dan periode pelaksanaannya.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama program</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={item?.nama ?? ""}
              placeholder="Contoh: Pelatihan digitalisasi BUMDes"
              maxLength={200}
              required
              autoFocus
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mitra">Mitra / pihak</Label>
              <Input
                id="mitra"
                name="mitra"
                defaultValue={item?.mitra ?? ""}
                placeholder="Contoh: Universitas Negeri"
                maxLength={200}
                aria-invalid={Boolean(fieldErrors?.mitra)}
              />
              <FieldError messages={fieldErrors?.mitra} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                min={2000}
                max={2100}
                step={1}
                defaultValue={item?.tahun ?? tahunAwal}
                aria-invalid={Boolean(fieldErrors?.tahun)}
              />
              <FieldError messages={fieldErrors?.tahun} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal mulai</Label>
              <Input
                id="tanggalMulai"
                name="tanggalMulai"
                type="date"
                defaultValue={item?.tanggalMulai ?? ""}
                aria-invalid={Boolean(fieldErrors?.tanggalMulai)}
              />
              <FieldError messages={fieldErrors?.tanggalMulai} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalSelesai">Tanggal selesai</Label>
              <Input
                id="tanggalSelesai"
                name="tanggalSelesai"
                type="date"
                defaultValue={item?.tanggalSelesai ?? ""}
                aria-invalid={Boolean(fieldErrors?.tanggalSelesai)}
              />
              <FieldError messages={fieldErrors?.tanggalSelesai} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              rows={3}
              maxLength={2000}
              defaultValue={item?.keterangan ?? ""}
              placeholder="Lingkup kerja sama, keluaran, atau catatan lain (opsional)"
              aria-invalid={Boolean(fieldErrors?.keterangan)}
            />
            <FieldError messages={fieldErrors?.keterangan} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Simpan program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
