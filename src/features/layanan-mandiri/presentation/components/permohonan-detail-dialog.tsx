"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  labelPermohonanStatus,
  parseBerkasSyarat,
  type PermohonanAdminRow,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import {
  buatKonsepSuratPermohonanAction,
  kembalikanPermohonanAction,
  prosesPermohonanAction,
} from "@/features/layanan-mandiri/presentation/actions";
import { parseIsianFields, parseNilaiIsian } from "@/features/surat/domain/isian";
import { idleActionState } from "@/lib/action-state";

function badgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 3) return "default";
  if (status === 4) return "outline";
  if (status === 0 || status === 5) return "destructive";
  return "secondary";
}

function tanggal(value: Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface DetailProps {
  permohonan: PermohonanAdminRow;
  /** Hanya peran dengan izin `update` yang melihat tombol aksi. */
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Dialog periksa permohonan + aksi proses operator. */
export function PermohonanDetailDialog({ permohonan, canManage, open, onOpenChange }: DetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"kembalikan" | "batalkan" | null>(null);
  const [alasan, setAlasan] = useState("");

  const syarat = parseBerkasSyarat(permohonan.syarat);
  const isianFields = parseIsianFields(permohonan.formIsian);
  const nilaiIsian = parseNilaiIsian(permohonan.isianForm);

  function tutup() {
    setMode(null);
    setAlasan("");
    onOpenChange(false);
  }

  function jalankanProses(status: number, catatan = "") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(permohonan.id));
      formData.set("status", String(status));
      formData.set("alasan", catatan);

      const result = await prosesPermohonanAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        tutup();
        router.refresh();
        return;
      }
      toast.error(result.status === "error" ? result.message : "Gagal memperbarui permohonan.");
    });
  }

  function jalankanKembalikan() {
    if (!alasan.trim()) {
      toast.error("Alasan wajib diisi.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(permohonan.id));
      formData.set("alasan", alasan);

      const result = await kembalikanPermohonanAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        tutup();
        router.refresh();
        return;
      }
      toast.error(result.status === "error" ? result.message : "Gagal mengembalikan permohonan.");
    });
  }

  function buatKonsep() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(permohonan.id));

      const result = await buatKonsepSuratPermohonanAction(idleActionState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        tutup();
        router.refresh();
        return;
      }
      toast.error(result.status === "error" ? result.message : "Gagal membuat konsep surat.");
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) tutup();
        else onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {permohonan.namaSurat ?? "Permohonan Surat"}
            <Badge variant={badgeVariant(permohonan.status)}>
              {labelPermohonanStatus(permohonan.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {permohonan.noAntrian ?? "Tanpa nomor antrian"} · {tanggal(permohonan.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <section className="rounded-lg border bg-muted/30 p-3">
            <dl className="grid gap-2 sm:grid-cols-[150px_1fr]">
              <dt className="text-muted-foreground">Pemohon</dt>
              <dd className="font-medium">{permohonan.namaPemohon ?? "—"}</dd>
              <dt className="text-muted-foreground">NIK</dt>
              <dd className="font-mono">{permohonan.nikPemohon ?? "—"}</dd>
              <dt className="text-muted-foreground">No. HP</dt>
              <dd>{permohonan.noHpAktif || "—"}</dd>
              <dt className="text-muted-foreground">Keterangan</dt>
              <dd>{permohonan.keterangan || "—"}</dd>
              {permohonan.letterNumber ? (
                <>
                  <dt className="text-muted-foreground">Nomor surat</dt>
                  <dd className="font-medium">{permohonan.letterNumber}</dd>
                </>
              ) : null}
            </dl>
          </section>

          {permohonan.alasan ? (
            <Alert
              variant={
                permohonan.status === 0 || permohonan.status === 5 ? "destructive" : "default"
              }
            >
              <AlertDescription>Catatan operator: {permohonan.alasan}</AlertDescription>
            </Alert>
          ) : null}

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4" />
              Isian surat
            </h3>
            {isianFields.length === 0 ? (
              <p className="text-muted-foreground">Tidak ada isian tambahan.</p>
            ) : (
              <dl className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[180px_1fr]">
                {isianFields.map((field) => (
                  <div key={field.kode} className="contents">
                    <dt className="text-muted-foreground">{field.label}</dt>
                    <dd className="font-medium">{nilaiIsian[field.kode] ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold">
              <FileText className="size-4" />
              Berkas syarat
            </h3>
            {syarat.length === 0 ? (
              <p className="text-muted-foreground">Tidak ada berkas syarat.</p>
            ) : (
              <ul className="space-y-1">
                {syarat.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`/permohonan-surat/${permohonan.id}/syarat/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      {item.nama} — {item.namaAsli}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {canManage && mode ? (
            <section className="space-y-2 rounded-lg border p-3">
              <Label htmlFor={`alasan-${permohonan.id}`}>
                {mode === "kembalikan" ? "Alasan pengembalian" : "Alasan pembatalan"}
              </Label>
              <Textarea
                id={`alasan-${permohonan.id}`}
                value={alasan}
                onChange={(event) => setAlasan(event.target.value)}
                maxLength={500}
                placeholder="Tuliskan catatan yang akan dibaca warga…"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() =>
                    mode === "kembalikan" ? jalankanKembalikan() : jalankanProses(5, alasan)
                  }
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <XCircle />}
                  {mode === "kembalikan" ? "Kembalikan permohonan" : "Batalkan permohonan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setMode(null);
                    setAlasan("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </section>
          ) : null}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {canManage && permohonan.status === 1 ? (
            <Button type="button" disabled={isPending} onClick={buatKonsep}>
              {isPending ? <Loader2 className="animate-spin" /> : <FileText />}
              Buat konsep & ajukan verifikasi
            </Button>
          ) : null}

          {canManage && permohonan.status === 0 ? (
            <Button type="button" disabled={isPending} onClick={() => jalankanProses(1)}>
              <RotateCcw />
              Periksa kembali
            </Button>
          ) : null}

          {canManage && permohonan.status === 3 ? (
            <Button type="button" disabled={isPending} onClick={() => jalankanProses(4)}>
              <CheckCircle2 />
              Tandai sudah diambil
            </Button>
          ) : null}

          {permohonan.letterId ? (
            <Button type="button" variant="outline" asChild>
              <Link
                href={`/persuratan/surat?q=${encodeURIComponent(permohonan.letterNumber ?? "")}`}
              >
                <ExternalLink />
                Buka persuratan
              </Link>
            </Button>
          ) : null}

          {canManage && (permohonan.status === 1 || permohonan.status === 2) ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setMode("kembalikan")}
            >
              <RotateCcw />
              Kembalikan
            </Button>
          ) : null}

          {canManage && permohonan.status !== 4 && permohonan.status !== 5 ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => setMode("batalkan")}
            >
              <XCircle />
              Batalkan
            </Button>
          ) : null}

          <Button type="button" variant="ghost" onClick={tutup}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
