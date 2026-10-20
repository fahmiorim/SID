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
import type { KlasifikasiSuratDTO, SuratMasukDTO } from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION, todayIsoDate } from "@/lib/forms";

import { saveSuratMasukAction } from "../agenda-actions";

interface SuratMasukFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classifications: KlasifikasiSuratDTO[];
  surat?: SuratMasukDTO | null;
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

export function SuratMasukFormDialog({
  open,
  onOpenChange,
  classifications,
  surat,
}: SuratMasukFormDialogProps) {
  const isEdit = Boolean(surat);
  const [state, formAction, isPending] = useActionState(saveSuratMasukAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Surat Masuk" : "Catat Surat Masuk"}</DialogTitle>
          <DialogDescription>Buku agenda surat yang diterima desa.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {surat ? <input type="hidden" name="id" value={surat.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="agendaNumber">No. Agenda</Label>
              <Input
                id="agendaNumber"
                name="agendaNumber"
                type="number"
                min={0}
                defaultValue={surat?.agendaNumber ?? 0}
              />
              <p className="text-xs text-muted-foreground">Isi 0 agar nomor diisi otomatis.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedDate">Tanggal Diterima</Label>
              <Input
                id="receivedDate"
                name="receivedDate"
                type="date"
                defaultValue={surat?.receivedDate ?? todayIsoDate()}
                required
                aria-invalid={Boolean(fieldErrors?.receivedDate)}
              />
              <FieldError messages={fieldErrors?.receivedDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterDate">Tanggal Surat</Label>
              <Input
                id="letterDate"
                name="letterDate"
                type="date"
                defaultValue={surat?.letterDate ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="letterNumber">Nomor Surat</Label>
              <Input
                id="letterNumber"
                name="letterNumber"
                defaultValue={surat?.letterNumber ?? ""}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender">Pengirim</Label>
              <Input id="sender" name="sender" defaultValue={surat?.sender ?? ""} maxLength={150} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="classificationId">Klasifikasi</Label>
              <Select
                name="classificationId"
                defaultValue={
                  surat?.classificationId ? String(surat.classificationId) : NO_SELECTION
                }
              >
                <SelectTrigger id="classificationId" className="w-full">
                  <SelectValue placeholder="Pilih klasifikasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>— Tidak ada —</SelectItem>
                  {classifications.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.code} — {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archiveLocation">Lokasi Arsip</Label>
              <Input
                id="archiveLocation"
                name="archiveLocation"
                defaultValue={surat?.archiveLocation ?? ""}
                maxLength={150}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Isi Singkat</Label>
            <Input
              id="summary"
              name="summary"
              defaultValue={surat?.summary ?? ""}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disposition">Disposisi</Label>
            <Textarea
              id="disposition"
              name="disposition"
              defaultValue={surat?.disposition ?? ""}
              rows={2}
              maxLength={255}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
