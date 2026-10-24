"use client";

import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  labelKategori,
  STATUS_PENGADUAN,
  TANGGAPAN_MAX,
  type PengaduanRow,
} from "@/features/pengaduan/domain/pengaduan";
import { idleActionState } from "@/lib/action-state";

import { tanggapiPengaduanAction } from "../actions";

interface PengaduanDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengaduan: PengaduanRow | null;
  /** Hanya pengguna dengan izin ubah yang boleh menanggapi. */
  canWrite: boolean;
}

function formatTanggal(value: Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function Baris({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

export function PengaduanDetailDialog({
  open,
  onOpenChange,
  pengaduan,
  canWrite,
}: PengaduanDetailDialogProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(tanggapiPengaduanAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    }
  }, [state, router]);

  if (!pengaduan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-8">{pengaduan.judul}</DialogTitle>
          <DialogDescription>
            {pengaduan.nomorTiket} · {labelKategori(pengaduan.kategori)} ·{" "}
            {formatTanggal(pengaduan.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 rounded-lg border p-3">
            <Baris label="Pelapor" value={pengaduan.namaPelapor} />
            <Baris label="NIK" value={pengaduan.nik} />
            <Baris label="Telepon" value={pengaduan.telepon} />
            <Baris label="Email" value={pengaduan.email} />
            <Baris label="Alamat" value={pengaduan.alamat} />
            {pengaduan.lampiran ? (
              <div className="flex gap-2 pt-1 text-sm">
                <span className="w-24 shrink-0 text-muted-foreground">Lampiran</span>
                <a
                  href={`/api/pengaduan/lampiran/${pengaduan.lampiran}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4"
                >
                  Buka lampiran
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Isi pengaduan</p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-line">
              {pengaduan.isi}
            </p>
          </div>

          {pengaduan.tanggapan ? (
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                Tanggapan terakhir
                <Badge variant="outline">
                  {pengaduan.petugasNama ?? "Petugas"} · {formatTanggal(pengaduan.ditanggapiPada)}
                </Badge>
              </p>
              <p className="rounded-lg border border-dashed p-3 text-sm leading-relaxed whitespace-pre-line">
                {pengaduan.tanggapan}
              </p>
            </div>
          ) : null}

          {canWrite ? (
            <form action={formAction} className="space-y-4 border-t pt-4">
              <input type="hidden" name="id" value={pengaduan.id} />

              <div className="space-y-2">
                <Label htmlFor="status">Status penanganan</Label>
                <Select name="status" defaultValue={pengaduan.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_PENGADUAN.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggapan">Tanggapan</Label>
                <Textarea
                  id="tanggapan"
                  name="tanggapan"
                  rows={4}
                  maxLength={TANGGAPAN_MAX}
                  defaultValue={pengaduan.tanggapan ?? ""}
                  placeholder="Jelaskan tindak lanjut atau alasan keputusan."
                  aria-invalid={Boolean(fieldErrors?.tanggapan)}
                />
                {fieldErrors?.tanggapan?.map((message) => (
                  <p key={message} className="text-xs text-destructive">
                    {message}
                  </p>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox
                  id="publik"
                  name="publik"
                  defaultChecked={pengaduan.publik}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label htmlFor="publik">Tampilkan di situs publik</Label>
                  <p className="text-xs text-muted-foreground">
                    Nama pelapor disamarkan; NIK, telepon, email, dan lampiran tidak pernah
                    ditampilkan.
                  </p>
                </div>
              </div>

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
                  Tutup
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : null}
                  Simpan tanggapan
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
