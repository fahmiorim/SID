"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  BOBOT_MAX,
  BOBOT_MIN,
  formatSkorPilihanForm,
  PERTANYAAN_MAX,
  PILIHAN_MAX,
  TIPE_SOAL,
  TIPE_SOAL_LABELS,
  type SoalRow,
  type TipeSoal,
} from "@/features/survey/domain/survey";
import { createIdleActionState } from "@/lib/action-state";

import { simpanSoalAction } from "../actions";

interface IndikatorPilihan {
  id: number;
  nama: string;
}

interface SoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: number;
  urutanAwal: number;
  soal?: SoalRow | null;
  indikator?: readonly IndikatorPilihan[];
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

export function SoalFormDialog({
  open,
  onOpenChange,
  surveyId,
  urutanAwal,
  soal,
  indikator = [],
}: SoalFormDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(soal);
  const [state, formAction, isPending] = useActionState(simpanSoalAction, createIdleActionState());
  const [tipe, setTipe] = useState<TipeSoal>(soal?.tipe ?? "text");
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Pertanyaan" : "Tambah Pertanyaan"}</DialogTitle>
          <DialogDescription>
            Responden wajib menjawab semua pertanyaan; pilihan ganda minimal dua opsi.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {soal ? <input type="hidden" name="id" value={soal.id} /> : null}
          <input type="hidden" name="surveyId" value={surveyId} />

          <div className="space-y-2">
            <Label htmlFor="pertanyaan">Pertanyaan</Label>
            <Textarea
              id="pertanyaan"
              name="pertanyaan"
              rows={3}
              required
              maxLength={PERTANYAAN_MAX}
              defaultValue={soal?.pertanyaan ?? ""}
              placeholder="Contoh: Bagaimana kepuasan Anda terhadap pelayanan surat desa?"
              aria-invalid={Boolean(fieldErrors?.pertanyaan)}
            />
            <FieldError messages={fieldErrors?.pertanyaan} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe jawaban</Label>
              <Select
                name="tipe"
                value={tipe}
                onValueChange={(value) => setTipe(value as TipeSoal)}
              >
                <SelectTrigger
                  id="tipe"
                  className="w-full"
                  aria-invalid={Boolean(fieldErrors?.tipe)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPE_SOAL.map((item) => (
                    <SelectItem key={item} value={item}>
                      {TIPE_SOAL_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.tipe} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bobot">Bobot</Label>
              <Input
                id="bobot"
                name="bobot"
                type="number"
                min={BOBOT_MIN}
                max={BOBOT_MAX}
                step={1}
                defaultValue={soal?.bobot ?? 1}
                aria-invalid={Boolean(fieldErrors?.bobot)}
              />
              <FieldError messages={fieldErrors?.bobot} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urutan">Urutan</Label>
              <Input
                id="urutan"
                name="urutan"
                type="number"
                min={0}
                step={1}
                defaultValue={soal?.urutan ?? urutanAwal}
                aria-invalid={Boolean(fieldErrors?.urutan)}
              />
              <FieldError messages={fieldErrors?.urutan} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="indikatorId">Indikator analisis</Label>
            <Select name="indikatorId" defaultValue={String(soal?.indikatorId ?? 0)}>
              <SelectTrigger
                id="indikatorId"
                className="w-full"
                aria-invalid={Boolean(fieldErrors?.indikatorId)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tanpa indikator</SelectItem>
                {indikator.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Pertanyaan dengan indikator yang sama digabung pada laporan skor.
            </p>
            <FieldError messages={fieldErrors?.indikatorId} />
          </div>

          {tipe === "choice" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="pilihan">Pilihan jawaban</Label>
                <Textarea
                  id="pilihan"
                  name="pilihan"
                  rows={5}
                  defaultValue={soal?.pilihan.join("\n") ?? ""}
                  placeholder={"Sangat baik\nBaik\nCukup\nKurang"}
                  aria-invalid={Boolean(fieldErrors?.pilihan)}
                />
                <p className="text-xs text-muted-foreground">
                  Satu pilihan per baris, {PILIHAN_MAX} pilihan maksimal.
                </p>
                <FieldError messages={fieldErrors?.pilihan} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skorPilihan">Skor pilihan (0–5)</Label>
                <Textarea
                  id="skorPilihan"
                  name="skorPilihan"
                  rows={5}
                  defaultValue={
                    soal
                      ? formatSkorPilihanForm(soal.pilihan, soal.skorPilihan)
                      : "Sangat baik=5\nBaik=4\nCukup=3\nKurang=2"
                  }
                  placeholder={"Sangat baik=5\nBaik=4\nCukup=3\nKurang=2"}
                  aria-invalid={Boolean(fieldErrors?.skorPilihan)}
                />
                <p className="text-xs text-muted-foreground">
                  Satu baris <code>Pilihan=skor</code>. Bila kosong, pilihan pertama bernilai 5 dan
                  menurun satu poin.
                </p>
                <FieldError messages={fieldErrors?.skorPilihan} />
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="pilihan" value="" />
              <input type="hidden" name="skorPilihan" value="" />
            </>
          )}

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
              {isEdit ? "Simpan perubahan" : "Tambah pertanyaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
