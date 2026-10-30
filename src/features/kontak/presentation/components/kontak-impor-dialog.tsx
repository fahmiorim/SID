"use client";

import { Download, Loader2, Plus, Upload } from "lucide-react";
import { useActionState, useState } from "react";

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
import { templateImporKontak } from "@/features/kontak/domain/kontak-berkas";
import { imporKontakAction } from "@/features/kontak/presentation/actions-kontak";

interface KontakImporDialogProps {
  trigger?: React.ReactNode;
}

/**
 * Dialog impor kontak dari berkas CSV/XLSX.
 */
export function KontakImporDialog({ trigger }: KontakImporDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(imporKontakAction, { status: "idle" });

  const downloadTemplate = () => {
    const blob = new Blob([templateImporKontak()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-impor-kontak.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Upload className="size-4" />
            Impor CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impor Kontak</DialogTitle>
          <DialogDescription>
            Unggah berkas CSV/XLSX dengan kolom: Nama (wajib), Telepon, Email, Telegram, Hubung
            Warga, Keterangan.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
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
            <p className="text-xs text-muted-foreground">
              Kolom: Nama (wajib), Telepon, Email, Telegram, Hubung Warga, Keterangan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="size-4" />
              Unduh Template
            </Button>
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
              {isPending ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
              Impor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
