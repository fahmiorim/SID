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
import {
  DEFAULT_NUMBER_FORMAT,
  placeholderHelp,
  type JenisSuratDTO,
  type KlasifikasiSuratDTO,
} from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { saveJenisSuratAction } from "../master-actions";

interface JenisSuratFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jenis?: JenisSuratDTO | null;
  classifications: KlasifikasiSuratDTO[];
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

export function JenisSuratFormDialog({
  open,
  onOpenChange,
  jenis,
  classifications,
}: JenisSuratFormDialogProps) {
  const isEdit = Boolean(jenis);
  const [state, formAction, isPending] = useActionState(saveJenisSuratAction, idleActionState);
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
          <DialogTitle>{isEdit ? "Ubah Jenis Surat" : "Tambah Jenis Surat"}</DialogTitle>
          <DialogDescription>
            Badan surat mendukung placeholder seperti [nama], [nik], dan [nomor_surat].
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {jenis ? <input type="hidden" name="id" value={jenis.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Surat</Label>
              <Input
                id="code"
                name="code"
                defaultValue={jenis?.code ?? ""}
                maxLength={20}
                placeholder="Mis. S-41"
                required
                aria-invalid={Boolean(fieldErrors?.code)}
              />
              <FieldError messages={fieldErrors?.code} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Surat</Label>
              <Input
                id="name"
                name="name"
                defaultValue={jenis?.name ?? ""}
                maxLength={150}
                required
                aria-invalid={Boolean(fieldErrors?.name)}
              />
              <FieldError messages={fieldErrors?.name} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="classificationId">Klasifikasi</Label>
              <Select
                name="classificationId"
                defaultValue={
                  jenis?.classificationId ? String(jenis.classificationId) : NO_SELECTION
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
              <Label htmlFor="numberFormat">Format Nomor</Label>
              <Input
                id="numberFormat"
                name="numberFormat"
                defaultValue={jenis?.numberFormat ?? DEFAULT_NUMBER_FORMAT}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.numberFormat)}
              />
              <p className="text-xs text-muted-foreground">
                [nomor], [kode_surat], [kode_desa], [tahun], [bulan_romawi]
              </p>
              <FieldError messages={fieldErrors?.numberFormat} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateBody">Badan Surat</Label>
            <Textarea
              id="templateBody"
              name="templateBody"
              defaultValue={jenis?.templateBody ?? ""}
              rows={10}
              className="font-mono text-sm"
              required
              aria-invalid={Boolean(fieldErrors?.templateBody)}
            />
            <p className="text-xs text-muted-foreground">Placeholder: {placeholderHelp()}</p>
            <FieldError messages={fieldErrors?.templateBody} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="validityMonths">Masa Berlaku (bulan)</Label>
              <Input
                id="validityMonths"
                name="validityMonths"
                type="number"
                min={0}
                max={120}
                defaultValue={jenis?.validityMonths ?? 1}
              />
              <FieldError messages={fieldErrors?.validityMonths} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Urutan</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={jenis?.sortOrder ?? 0}
              />
            </div>

            <div className="flex flex-col gap-2 pt-7">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requiresResident"
                  name="requiresResident"
                  defaultChecked={jenis?.requiresResident ?? true}
                />
                <Label htmlFor="requiresResident">Wajib penduduk</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isActive" name="isActive" defaultChecked={jenis?.isActive ?? true} />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
