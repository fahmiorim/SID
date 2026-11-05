"use client";

import { AlertCircle, Download, FileUp, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sasaranLabel, type BantuanListRow } from "@/features/bantuan/domain/bantuan";
import {
  kolomImporPeserta,
  namaBerkasTemplateImporPeserta,
  sasaranKolomLabel,
  templateImporPeserta,
} from "@/features/bantuan/domain/impor-peserta";
import { imporPesertaAction } from "@/features/bantuan/presentation/actions";

/**
 * Dialog impor peserta bantuan.
 *
 * Template diunduh di klien (tanpa rute tambahan) dan memakai definisi kolom
 * yang sama dengan pembaca berkas di server, sehingga header hasil unduhan
 * selalu dikenali.
 */
export function PesertaImportDialog({
  program,
  onImported,
}: {
  program: BantuanListRow;
  onImported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const kolom = kolomImporPeserta(program.sasaran);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const state = await imporPesertaAction(formData);
      if (state.status === "success" || state.status === "error") {
        setMessage({ ok: state.status === "success", text: state.message });
        if (state.status === "success") {
          toast.success(state.message);
          formRef.current?.reset();
          onImported();
        } else {
          toast.error(state.message);
        }
      }
    });
  }

  function unduhTemplate() {
    const blob = new Blob([templateImporPeserta(program.sasaran)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = namaBerkasTemplateImporPeserta(program.sasaran);
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FileUp className="size-4" />
        Impor
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Impor Peserta — {program.name}</DialogTitle>
            <DialogDescription>
              Sasaran {sasaranLabel(program.sasaran)} · kolom identitas{" "}
              <span className="font-medium">{sasaranKolomLabel(program.sasaran)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <input type="hidden" name="programId" value={program.id} />

              <div className="space-y-2">
                <Label htmlFor="berkas-impor-peserta">Berkas CSV/XLSX</Label>
                <Input
                  id="berkas-impor-peserta"
                  name="berkas"
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Kolom: {kolom.map((item) => item.label).join(", ")}. Baris yang kodenya tidak
                  ditemukan atau sudah terdaftar akan dilewati.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : <FileUp className="size-4" />}
                  Impor
                </Button>
                <Button type="button" variant="outline" onClick={unduhTemplate}>
                  <Download className="size-4" />
                  Unduh template
                </Button>
              </div>
            </form>

            {message ? (
              <Alert variant={message.ok ? "default" : "destructive"}>
                <AlertCircle />
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
