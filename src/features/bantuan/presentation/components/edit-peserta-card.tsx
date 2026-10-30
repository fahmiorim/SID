"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { idleActionState } from "@/lib/action-state";

import { updatePesertaAction } from "../actions";

interface EditPesertaCardProps {
  programId: number;
  pesertaId: number;
  initial: {
    cardNumber: string | null;
    cardName: string | null;
    cardNationalId: string | null;
    cardBirthPlace: string | null;
    cardBirthDate: string | null;
    cardAddress: string | null;
  };
  trigger: ReactNode;
}

/**
 * Dialog kecil untuk mengubah snapshot kartu seorang peserta.
 *
 * Hanya kolom `card_*` yang boleh diubah; kolom sasaran (penduduk/keluarga/
 * rumah tangga/kelompok) tidak berubah — ganti peserta berarti keluarkan dulu.
 */
export function EditPesertaCard({ programId, pesertaId, initial, trigger }: EditPesertaCardProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updatePesertaAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Kartu Peserta</DialogTitle>
          <DialogDescription>Salinan cetak yang boleh berbeda dari data master.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="programId" value={programId} />
          <input type="hidden" name="pesertaId" value={pesertaId} />

          <div className="space-y-2">
            <Label htmlFor="nomorKartu">No. Kartu</Label>
            <Input
              id="nomorKartu"
              name="nomorKartu"
              maxLength={60}
              defaultValue={initial.cardNumber ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kartuNama">Nama pada Kartu</Label>
            <Input
              id="kartuNama"
              name="kartuNama"
              maxLength={100}
              defaultValue={initial.cardName ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kartuNik">NIK pada Kartu</Label>
            <Input
              id="kartuNik"
              name="kartuNik"
              maxLength={16}
              inputMode="numeric"
              defaultValue={initial.cardNationalId ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="kartuTempatLahir">Tempat Lahir</Label>
              <Input
                id="kartuTempatLahir"
                name="kartuTempatLahir"
                maxLength={100}
                defaultValue={initial.cardBirthPlace ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kartuTanggalLahir">Tanggal Lahir</Label>
              <Input
                id="kartuTanggalLahir"
                name="kartuTanggalLahir"
                type="date"
                defaultValue={initial.cardBirthDate ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kartuAlamat">Alamat pada Kartu</Label>
            <Input
              id="kartuAlamat"
              name="kartuAlamat"
              maxLength={255}
              defaultValue={initial.cardAddress ?? ""}
            />
          </div>

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
