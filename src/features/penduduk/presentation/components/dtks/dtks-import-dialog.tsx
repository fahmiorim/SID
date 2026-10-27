"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
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

import { imporDtksAction } from "../../actions-dtks-berkas";

/**
 * Dialog impor DTKS dari CSV/XLSX.
 *
 * Impor menautkan nomor RTM yang sudah ada ke formulir DTKS; berkas tidak
 * membuat penduduk/RTM baru. Ringkasan hasil ditampilkan apa adanya agar
 * pengguna tahu baris mana yang tidak ditemukan.
 */
export function DtksImportDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function kirim(formData: FormData) {
    setPending(true);
    setPesan(null);

    const hasil = await imporDtksAction(formData);

    setPending(false);
    setPesan({ ok: hasil.ok, teks: hasil.message });

    if (hasil.ok) {
      toast.success(hasil.message);
      formRef.current?.reset();
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileUp className="size-4" />
        Impor
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Impor DTKS</DialogTitle>
            <DialogDescription>
              Unggah berkas CSV, TXT, atau XLSX dengan kolom <strong>No. RTM</strong> (wajib), serta
              opsional Nama Responden, Nama Petugas, dan Tanggal Pencacahan.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} action={kirim} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="berkas-dtks">Berkas</Label>
              <Input
                id="berkas-dtks"
                name="berkas"
                type="file"
                accept=".csv,.txt,.xlsx"
                required
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Maksimal 5 MB. RTM yang sudah punya formulir DTKS akan dilewati.
              </p>
            </div>

            {pesan ? (
              <Alert variant={pesan.ok ? "default" : "destructive"}>
                <AlertDescription>{pesan.teks}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Tutup
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : null}
                Impor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
