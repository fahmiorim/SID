"use client";

import { AlertCircle } from "lucide-react";
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
import type { PendudukListRow } from "@/features/penduduk/domain/penduduk";
import { catatPindahKeluarAction } from "@/features/penduduk/presentation/actions-riwayat";
import { idleActionState } from "@/lib/action-state";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendudukOptions: PendudukListRow[];
}

export function CatatPindahKeluarDialog({ open, onOpenChange, pendudukOptions }: Props) {
  const [state, formAction, isPending] = useActionState(catatPindahKeluarAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Pindah keluar berhasil dicatat.");
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Catat Pindah Keluar</DialogTitle>
          <DialogDescription>
            Ubah status penduduk menjadi pindah dan catat riwayat.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="residentId">Pilih Penduduk *</Label>
            <select
              id="residentId"
              name="residentId"
              required
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option value="">Pilih penduduk</option>
              {pendudukOptions
                .filter((p) => p.lifeStatus === "alive")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.nationalId ? `- ${p.nationalId}` : ""}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="eventDate">Tanggal Pindah *</Label>
            <Input id="eventDate" name="eventDate" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="referenceNo">No. Surat Pindah</Label>
            <Input id="referenceNo" name="referenceNo" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="toAddress">Alamat Tujuan</Label>
            <Input id="toAddress" name="toAddress" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="destination">Tujuan (Kab/Kota/Provinsi)</Label>
            <Input id="destination" name="destination" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Alasan</Label>
            <Input id="reason" name="reason" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Keterangan</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
