"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
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
import type { KredensialWarga } from "@/features/warga/domain/warga";

interface KredensialWargaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kredensial: KredensialWarga | null;
  judul: string;
}

/** Tampilkan NIK & PIN sekali saja setelah akun dibuat/direset. */
export function KredensialWargaDialog({
  open,
  onOpenChange,
  kredensial,
  judul,
}: KredensialWargaDialogProps) {
  const [copied, setCopied] = useState(false);

  async function salin() {
    if (!kredensial) return;

    try {
      await navigator.clipboard.writeText(`NIK: ${kredensial.username}\nPIN: ${kredensial.pin}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin. Catat NIK dan PIN secara manual.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setCopied(false);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            {judul}
          </DialogTitle>
          <DialogDescription>
            Sampaikan kredensial ini kepada warga. PIN hanya ditampilkan sekali dan wajib diganti
            saat login pertama.
          </DialogDescription>
        </DialogHeader>

        {kredensial ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">NIK (username)</dt>
                  <dd className="font-mono text-base font-semibold tracking-wider">
                    {kredensial.username}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">PIN sementara</dt>
                  <dd className="font-mono text-2xl font-bold tracking-[0.35em]">
                    {kredensial.pin}
                  </dd>
                </div>
              </dl>
            </div>

            <Alert>
              <AlertDescription>
                PIN tidak dapat dilihat lagi setelah dialog ditutup. Jika hilang, gunakan tombol
                &ldquo;Reset PIN&rdquo; pada data penduduk.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={salin} disabled={!kredensial}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Tersalin" : "Salin NIK & PIN"}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
