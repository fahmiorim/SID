"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
import { parseIsianFields, parseNilaiIsian } from "@/features/surat/domain/isian";
import type { JenisSuratDTO, SuratListRow } from "@/features/surat/domain/surat";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION, todayIsoDate } from "@/lib/forms";

import { saveSuratAction } from "../actions";
import { IsianFields } from "./isian-fields";

interface PendudukOption {
  id: number;
  name: string;
  nationalId: string | null;
}

interface SuratFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jenis: JenisSuratDTO[];
  penduduk: PendudukOption[];
  surat?: SuratListRow | null;
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

export function SuratFormDialog({
  open,
  onOpenChange,
  jenis,
  penduduk,
  surat,
}: SuratFormDialogProps) {
  const isEdit = Boolean(surat);
  const [state, formAction, isPending] = useActionState(saveSuratAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const [typeId, setTypeId] = useState(surat ? String(surat.typeId) : "");

  const activeJenis = jenis.find((item) => String(item.id) === typeId);
  const isianFields = parseIsianFields(activeJenis?.formIsian);
  const isianValues = parseNilaiIsian(surat?.nilaiIsian);

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
          <DialogTitle>{isEdit ? "Ubah Konsep Surat" : "Buat Surat Baru"}</DialogTitle>
          <DialogDescription>
            Surat disimpan sebagai konsep. Nomor surat diberikan otomatis saat diterbitkan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {surat ? <input type="hidden" name="id" value={surat.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="typeId">Jenis Surat</Label>
            <Select name="typeId" value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="typeId" className="w-full">
                <SelectValue placeholder="Pilih jenis surat" />
              </SelectTrigger>
              <SelectContent>
                {jenis.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name} ({item.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={fieldErrors?.typeId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="residentId">Penduduk</Label>
            <Select
              name="residentId"
              defaultValue={surat?.residentId ? String(surat.residentId) : NO_SELECTION}
            >
              <SelectTrigger id="residentId" className="w-full">
                <SelectValue placeholder="Pilih penduduk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SELECTION}>— Tidak ada —</SelectItem>
                {penduduk.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                    {item.nationalId ? ` — ${item.nationalId}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Wajib untuk jenis surat yang membutuhkan data penduduk.
            </p>
            <FieldError messages={fieldErrors?.residentId} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="letterDate">Tanggal Surat</Label>
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

            <div className="space-y-2">
              <Label htmlFor="purpose">Keperluan</Label>
              <Input
                id="purpose"
                name="purpose"
                defaultValue={surat?.purpose ?? ""}
                maxLength={255}
                placeholder="Mis. pengurusan SKCK"
                aria-invalid={Boolean(fieldErrors?.purpose)}
              />
              <FieldError messages={fieldErrors?.purpose} />
            </div>
          </div>

          <IsianFields fields={isianFields} values={isianValues} errors={fieldErrors} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan" : "Simpan Konsep"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
