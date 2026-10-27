"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

import { imporTerdataSuplemenAction } from "../../actions-suplemen-berkas";

interface SuplemenImporDialogProps {
  suplemenId: number;
  sasaran: number;
}

/**
 * Dialog impor terdata suplemen.
 *
 * Kolom tetap: "NIK / No. KK" sesuai sasaran suplemen; kolom lain pada berkas
 * (mis. Keterangan, Jenis Bantuan) otomatis tersimpan sebagai isian dinamis
 * suplemen tersebut.
 */
export function SuplemenImporDialog({ suplemenId, sasaran }: SuplemenImporDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const kolomSasaran = sasaran === 2 ? "No. KK" : "NIK";

  async function kirim(formData: FormData) {
    setPending(true);
    setPesan(null);

    const hasil = await imporTerdataSuplemenAction(formData);

    setPending(false);
    setPesan({ ok: hasil.ok, teks: hasil.message });

    if (hasil.ok) {
      toast.success(hasil.message);
      formRef.current?.reset();
      router.refresh();
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
            <DialogTitle>Impor Terdata</DialogTitle>
            <DialogDescription>
              Unggah CSV, TXT, atau XLSX dengan kolom <strong>{kolomSasaran}</strong> (wajib) dan
              kolom isian tambahan apa pun yang dipakai suplemen ini.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} action={kirim} className="space-y-4">
            <input type="hidden" name="suplemenId" value={suplemenId} />

            <div className="space-y-2">
              <Label htmlFor="berkas-suplemen">Berkas</Label>
              <Input
                id="berkas-suplemen"
                name="berkas"
                type="file"
                accept=".csv,.txt,.xlsx"
                required
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Sasaran yang sudah terdata akan dilewati; maksimal 5 MB.
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
