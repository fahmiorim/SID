"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { KlasifikasiSuratDTO, SuratDinasDTO } from "@/features/surat/domain/surat";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION, todayIsoDate } from "@/lib/forms";

import { saveSuratDinasAction } from "../surat-dinas-actions";

interface SuratDinasFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classifications: KlasifikasiSuratDTO[];
  surat?: SuratDinasDTO | null;
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

export function SuratDinasFormDialog({
  open,
  onOpenChange,
  classifications,
  surat,
}: SuratDinasFormDialogProps) {
  const isEdit = Boolean(surat);
  const [state, formAction, isPending] = useActionState(
    saveSuratDinasAction,
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Surat Dinas" : "Catat Surat Dinas"}</DialogTitle>
          <DialogDescription>
            Surat dinas antar instansi; lampiran arsip disimpan sebagai berkas softcopy.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {surat ? <input type="hidden" name="id" value={surat.id} /> : null}
          <input type="hidden" name="archiveFile" value={surat?.archiveFile ?? ""} />

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="letterNumber">Nomor Surat *</Label>
              <Input
                id="letterNumber"
                name="letterNumber"
                defaultValue={surat?.letterNumber ?? ""}
                maxLength={100}
                required
                aria-invalid={Boolean(fieldErrors?.letterNumber)}
              />
              <FieldError messages={fieldErrors?.letterNumber} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterDate">Tanggal Surat *</Label>
              <Input
                id="letterDate"
                name="letterDate"
                type="date"
                defaultValue={surat?.letterDate ?? todayIsoDate()}
                required
                aria-invalid={Boolean(fieldErrors?.letterDate)}
              />
              <FieldError messages={fieldErrors?.letterDate} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Penerima</Label>
              <Input
                id="recipient"
                name="recipient"
                defaultValue={surat?.recipient ?? ""}
                maxLength={150}
                placeholder="Mis. Camat Kabupaten"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Alamat Penerima</Label>
              <Input
                id="recipientAddress"
                name="recipientAddress"
                defaultValue={surat?.recipientAddress ?? ""}
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Perihal *</Label>
            <Input
              id="subject"
              name="subject"
              defaultValue={surat?.subject ?? ""}
              maxLength={200}
              required
              aria-invalid={Boolean(fieldErrors?.subject)}
            />
            <FieldError messages={fieldErrors?.subject} />
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
              <Label htmlFor="archiveLocation">Lokasi Arsip Fisik</Label>
              <Input
                id="archiveLocation"
                name="archiveLocation"
                defaultValue={surat?.archiveLocation ?? ""}
                maxLength={150}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Isi Surat</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={surat?.content ?? ""}
              rows={4}
              maxLength={4000}
            />
          </div>

          {/* Arsip lampiran */}
          <div className="space-y-2 rounded-lg border p-3">
            <Label htmlFor="arsipBerkas">Lampiran Arsip (berkas)</Label>
            <Input
              id="arsipBerkas"
              name="arsipBerkas"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
            />
            <p className="text-xs text-muted-foreground">
              Unggahan baru mengganti lampiran sebelumnya.
              {surat?.archiveFile ? " Saat ini sudah ada berkas tersimpan." : ""}
            </p>
            {surat?.archiveFile && isEdit ? (
              <div className="flex items-center gap-2">
                <Checkbox id="hapusArsip" name="hapusArsip" value="1" />
                <Label htmlFor="hapusArsip" className="text-sm font-normal">
                  Hapus lampiran arsip tersimpan
                </Label>
              </div>
            ) : null}
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
