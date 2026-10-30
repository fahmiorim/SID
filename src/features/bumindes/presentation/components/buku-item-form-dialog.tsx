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
import {
  KETERANGAN_ITEM_MAX,
  URAIAN_ITEM_MAX,
  type ItemBukuRow,
} from "@/features/bumindes/domain/bumindes";
import { createIdleActionState } from "@/lib/action-state";
import { todayIsoDate } from "@/lib/forms";

import { simpanItemBukuAction } from "../actions";

interface BukuItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bukuId: number;
  /** Nomor urut saran untuk item baru. */
  nomorUrutAwal: number;
  item?: ItemBukuRow | null;
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

/** Formulir item buku; dipakai untuk tambah maupun ubah. */
export function BukuItemFormDialog({
  open,
  onOpenChange,
  bukuId,
  nomorUrutAwal,
  item,
}: BukuItemFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    simpanItemBukuAction,
    createIdleActionState(),
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
          <DialogTitle>{isEdit ? "Ubah Item Buku" : "Tambah Item Buku"}</DialogTitle>
          <DialogDescription>
            Catatan akan tersimpan berurutan menurut nomor urut pada buku ini.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}
          <input type="hidden" name="bukuId" value={bukuId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomorUrut">Nomor urut</Label>
              <Input
                id="nomorUrut"
                name="nomorUrut"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={item?.nomorUrut ?? nomorUrutAwal}
                aria-invalid={Boolean(fieldErrors?.nomorUrut)}
              />
              <FieldError messages={fieldErrors?.nomorUrut} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={item?.tanggal ?? todayIsoDate()}
                aria-invalid={Boolean(fieldErrors?.tanggal)}
              />
              <FieldError messages={fieldErrors?.tanggal} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uraian">Uraian</Label>
            <Textarea
              id="uraian"
              name="uraian"
              rows={3}
              required
              maxLength={URAIAN_ITEM_MAX}
              defaultValue={item?.uraian ?? ""}
              placeholder="Contoh: Peraturan Desa Nomor 3 Tahun 2026 tentang APBDes"
              aria-invalid={Boolean(fieldErrors?.uraian)}
            />
            <FieldError messages={fieldErrors?.uraian} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              rows={2}
              maxLength={KETERANGAN_ITEM_MAX}
              defaultValue={item?.keterangan ?? ""}
              placeholder="Opsional"
              aria-invalid={Boolean(fieldErrors?.keterangan)}
            />
            <FieldError messages={fieldErrors?.keterangan} />
          </div>

          {state.status === "error" && !state.fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

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
              {isEdit ? "Simpan perubahan" : "Tambah item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
