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
  STATUS_PEMBANGUNAN,
  STATUS_PEMBANGUNAN_LABELS,
  SUMBER_DANA_PEMBANGUNAN,
  type PembangunanProyekDTO,
} from "@/features/pembangunan/domain/pembangunan";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { savePembangunanAction } from "../actions";

interface PembangunanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  proyek?: PembangunanProyekDTO | null;
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

/** Dialog formulir tambah/ubah proyek pembangunan. */
export function PembangunanFormDialog({ open, onOpenChange, proyek }: PembangunanFormDialogProps) {
  const isEdit = Boolean(proyek);
  const [state, formAction, isPending] = useActionState(
    savePembangunanAction,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ubah Proyek Pembangunan" : "Tambah Proyek Pembangunan"}
          </DialogTitle>
          <DialogDescription>
            Catat rencana, realisasi, dan hasil proyek pembangunan desa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {proyek ? <input type="hidden" name="id" value={proyek.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="judul">Judul Proyek</Label>
            <Input
              id="judul"
              name="judul"
              defaultValue={proyek?.judul ?? ""}
              maxLength={200}
              aria-invalid={Boolean(fieldErrors?.judul)}
            />
            <FieldError messages={fieldErrors?.judul} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tahunAnggaran">Tahun Anggaran</Label>
              <Input
                id="tahunAnggaran"
                name="tahunAnggaran"
                type="number"
                min={2000}
                max={2100}
                defaultValue={proyek?.tahunAnggaran ?? new Date().getFullYear()}
                aria-invalid={Boolean(fieldErrors?.tahunAnggaran)}
              />
              <FieldError messages={fieldErrors?.tahunAnggaran} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={proyek?.status ?? "rencana"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_PEMBANGUNAN.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_PEMBANGUNAN_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.status} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sumberDana">Sumber Dana</Label>
              <Select name="sumberDana" defaultValue={proyek?.sumberDana ?? NO_SELECTION}>
                <SelectTrigger id="sumberDana" className="w-full">
                  <SelectValue placeholder="Pilih sumber dana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>Tidak ditentukan</SelectItem>
                  {SUMBER_DANA_PEMBANGUNAN.map((sumber) => (
                    <SelectItem key={sumber} value={sumber}>
                      {sumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.sumberDana} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anggaran">Anggaran (Rp)</Label>
              <Input
                id="anggaran"
                name="anggaran"
                type="number"
                min={0}
                step="0.01"
                defaultValue={proyek?.anggaran ?? ""}
                aria-invalid={Boolean(fieldErrors?.anggaran)}
              />
              <FieldError messages={fieldErrors?.anggaran} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                name="volume"
                type="number"
                min={0}
                step="0.01"
                defaultValue={proyek?.volume ?? ""}
                aria-invalid={Boolean(fieldErrors?.volume)}
              />
              <FieldError messages={fieldErrors?.volume} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan</Label>
              <Input
                id="satuan"
                name="satuan"
                defaultValue={proyek?.satuan ?? ""}
                maxLength={30}
                placeholder="mis. meter"
                aria-invalid={Boolean(fieldErrors?.satuan)}
              />
              <FieldError messages={fieldErrors?.satuan} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mulai">Tanggal Mulai</Label>
              <Input
                id="mulai"
                name="mulai"
                type="date"
                defaultValue={proyek?.mulai ?? ""}
                aria-invalid={Boolean(fieldErrors?.mulai)}
              />
              <FieldError messages={fieldErrors?.mulai} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selesai">Tanggal Selesai</Label>
              <Input
                id="selesai"
                name="selesai"
                type="date"
                defaultValue={proyek?.selesai ?? ""}
                aria-invalid={Boolean(fieldErrors?.selesai)}
              />
              <FieldError messages={fieldErrors?.selesai} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progres">Progres Fisik (%)</Label>
              <Input
                id="progres"
                name="progres"
                type="number"
                min={0}
                max={100}
                defaultValue={proyek?.progres ?? 0}
                aria-invalid={Boolean(fieldErrors?.progres)}
              />
              <FieldError messages={fieldErrors?.progres} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input
                id="lokasi"
                name="lokasi"
                defaultValue={proyek?.lokasi ?? ""}
                maxLength={200}
                aria-invalid={Boolean(fieldErrors?.lokasi)}
              />
              <FieldError messages={fieldErrors?.lokasi} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pelaksana">Pelaksana</Label>
            <Input
              id="pelaksana"
              name="pelaksana"
              defaultValue={proyek?.pelaksana ?? ""}
              maxLength={200}
              placeholder="Kontraktor / swakelola / masyarakat"
              aria-invalid={Boolean(fieldErrors?.pelaksana)}
            />
            <FieldError messages={fieldErrors?.pelaksana} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              defaultValue={proyek?.deskripsi ?? ""}
              maxLength={2000}
              aria-invalid={Boolean(fieldErrors?.deskripsi)}
            />
            <FieldError messages={fieldErrors?.deskripsi} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hasil">Hasil / Manfaat</Label>
            <Textarea
              id="hasil"
              name="hasil"
              rows={3}
              defaultValue={proyek?.hasil ?? ""}
              maxLength={2000}
              aria-invalid={Boolean(fieldErrors?.hasil)}
            />
            <FieldError messages={fieldErrors?.hasil} />
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
