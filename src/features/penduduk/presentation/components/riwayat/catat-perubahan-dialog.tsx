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
import {
  LIFE_STATUS_LABELS,
  LIFE_STATUSES,
  type PendudukListRow,
} from "@/features/penduduk/domain/penduduk";
import { catatPerubahanAction } from "@/features/penduduk/presentation/actions-riwayat";
import { idleActionState } from "@/lib/action-state";

const STATUS_OPTIONS = LIFE_STATUSES.filter(
  (status) => status !== "deceased" && status !== "moved",
);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendudukOptions: PendudukListRow[];
}

export function CatatPerubahanDialog({ open, onOpenChange, pendudukOptions }: Props) {
  const [state, formAction, isPending] = useActionState(catatPerubahanAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Perubahan status berhasil dicatat.");
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Catat Perubahan Status</DialogTitle>
          <DialogDescription>
            Ubah status kependudukan dan catat riwayatnya. Untuk kematian atau pindah keluar,
            gunakan menu khusus.
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
              {pendudukOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.nationalId ? `- ${p.nationalId}` : ""} (
                  {LIFE_STATUS_LABELS[p.lifeStatus]})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="eventDate">Tanggal Perubahan *</Label>
            <Input id="eventDate" name="eventDate" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lifeStatus">Status Kependudukan Baru *</Label>
            <select
              id="lifeStatus"
              name="lifeStatus"
              required
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option value="">Pilih status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {LIFE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="referenceNo">No. Surat/Dokumen</Label>
            <Input id="referenceNo" name="referenceNo" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Alasan Perubahan</Label>
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
