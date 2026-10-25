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
import { catatKelahiranAction } from "@/features/penduduk/presentation/actions-riwayat";
import { idleActionState } from "@/lib/action-state";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CatatKelahiranDialog({ open, onOpenChange }: Props) {
  const [state, formAction, isPending] = useActionState(catatKelahiranAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Kelahiran berhasil dicatat.");
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Catat Kelahiran</DialogTitle>
          <DialogDescription>
            Tambahkan bayi lahir ke data penduduk dan catat riwayatnya.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="eventDate">Tanggal Lahir *</Label>
              <Input id="eventDate" name="eventDate" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama Bayi *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nationalId">NIK</Label>
              <Input id="nationalId" name="nationalId" maxLength={16} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <select id="gender" name="gender" className="h-9 rounded-md border px-3 text-sm">
                <option value="">Pilih</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fatherName">Nama Ayah</Label>
              <Input id="fatherName" name="fatherName" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="motherName">Nama Ibu</Label>
              <Input id="motherName" name="motherName" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="referenceNo">No. Surat Kelahiran</Label>
              <Input id="referenceNo" name="referenceNo" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" name="address" />
            </div>
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
