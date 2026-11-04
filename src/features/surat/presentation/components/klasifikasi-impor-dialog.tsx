"use client";

import { Download, Loader2, Upload } from "lucide-react";
import { useActionState, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { templateImporKlasifikasi } from "@/features/surat/domain/klasifikasi-berkas";
import { createIdleActionState, type ActionState } from "@/lib/action-state";

import { imporKlasifikasiAction } from "../master-actions";

export function KlasifikasiImporDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: ActionState, formData: FormData) => {
      const result = await imporKlasifikasiAction(previousState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
      }
      return result;
    },
    createIdleActionState(),
  );

  const unduhTemplate = () => {
    const blob = new Blob([templateImporKlasifikasi()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "template-impor-klasifikasi.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="size-4" />
          Impor Kode Lama
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impor Klasifikasi Surat</DialogTitle>
          <DialogDescription>
            Unggah CSV/XLSX berisi kolom Kode (wajib), Nama (wajib), dan Keterangan. Kode yang sudah
            ada akan diperbarui; kode baru ditambahkan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="berkas">Berkas CSV/XLSX</Label>
            <Input
              id="berkas"
              name="berkas"
              type="file"
              accept=".csv,.txt,.xlsx"
              required
              disabled={isPending}
            />
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={unduhTemplate}>
            <Download className="size-4" />
            Unduh Template
          </Button>

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
              Impor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
