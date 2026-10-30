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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ASAL_DANA_BANTUAN,
  ASAL_DANA_LABELS,
  SASARAN_BANTUAN,
  SASARAN_LABELS,
  type BantuanDTO,
} from "@/features/bantuan/domain/bantuan";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { saveBantuanAction } from "../actions";

interface BantuanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  bantuan?: BantuanDTO | null;
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
 * Dialog formulir tambah/ubah program bantuan (terkendali).
 *
 * Slug tidak ditampilkan sebagai isian: dibentuk otomatis dari nama saat
 * penyimpanan. Radix membongkar isi dialog saat tertutup sehingga state
 * `useActionState` otomatis bersih setiap kali dialog dibuka.
 */
export function BantuanFormDialog({ open, onOpenChange, bantuan }: BantuanFormDialogProps) {
  const isEdit = Boolean(bantuan);
  const [state, formAction, isPending] = useActionState(saveBantuanAction, createIdleActionState());
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
          <DialogTitle>{isEdit ? "Ubah Program Bantuan" : "Tambah Program Bantuan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data program bantuan."
              : "Catat program bantuan baru beserta sasaran dan masa aktifnya."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {bantuan ? <input type="hidden" name="id" value={bantuan.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Program</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={bantuan?.name ?? ""}
              maxLength={100}
              aria-invalid={Boolean(fieldErrors?.nama)}
            />
            <FieldError messages={fieldErrors?.nama} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sasaran">Sasaran</Label>
              <Select
                name="sasaran"
                defaultValue={bantuan?.sasaran ? String(bantuan.sasaran) : "1"}
              >
                <SelectTrigger id="sasaran" className="w-full">
                  <SelectValue placeholder="Pilih sasaran" />
                </SelectTrigger>
                <SelectContent>
                  {SASARAN_BANTUAN.map((sasaran) => (
                    <SelectItem key={sasaran} value={String(sasaran)}>
                      {SASARAN_LABELS[sasaran]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.sasaran} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asalDana">Asal Dana</Label>
              <Select
                name="asalDana"
                defaultValue={bantuan?.asalDana ? String(bantuan.asalDana) : NO_SELECTION}
              >
                <SelectTrigger id="asalDana" className="w-full">
                  <SelectValue placeholder="Pilih asal dana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>—</SelectItem>
                  {ASAL_DANA_BANTUAN.map((asal) => (
                    <SelectItem key={asal} value={String(asal)}>
                      {ASAL_DANA_LABELS[asal]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.asalDana} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
              <Input
                id="tanggalMulai"
                name="tanggalMulai"
                type="date"
                defaultValue={bantuan?.startDate ?? ""}
                aria-invalid={Boolean(fieldErrors?.tanggalMulai)}
              />
              <FieldError messages={fieldErrors?.tanggalMulai} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalAkhir">Tanggal Akhir</Label>
              <Input
                id="tanggalAkhir"
                name="tanggalAkhir"
                type="date"
                defaultValue={bantuan?.endDate ?? ""}
                aria-invalid={Boolean(fieldErrors?.tanggalAkhir)}
              />
              <FieldError messages={fieldErrors?.tanggalAkhir} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={bantuan?.description ?? ""}
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
