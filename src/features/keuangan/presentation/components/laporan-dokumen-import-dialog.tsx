"use client";

import { AlertCircle, FileUp, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LAPORAN_TIPE_OPTIONS,
  MAKS_UKURAN_BERKAS,
  PDF_MIME,
  SEMESTER_OPTIONS,
} from "@/features/keuangan/domain/laporan-dokumen";
import {
  judulDariNamaBerkas,
  MAKS_DOKUMEN_IMPOR,
} from "@/features/keuangan/domain/laporan-dokumen-impor";
import { createIdleActionState } from "@/lib/action-state";

import { imporDokumenLaporanAction } from "../laporan-dokumen-actions";

interface BarisImpor {
  file: File;
  judul: string;
  jenis: string;
  tahun: number;
  semester: number;
}

function formatUkuran(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Pesan masalah berkas (bukan metadata) untuk peringatan dini di klien. */
function masalahBerkas(file: File): string | null {
  if (file.type !== PDF_MIME && !/\.pdf$/i.test(file.name)) return "Bukan PDF";
  if (file.size > MAKS_UKURAN_BERKAS) return "Melebihi 8 MB";
  return null;
}

/**
 * Dialog impor banyak dokumen laporan sekaligus.
 *
 * Operator memilih beberapa berkas PDF, lalu menyetel metadata (judul, jenis,
 * tahun, semester) tiap berkas. Validasi final dilakukan di server; di sini
 * hanya peringatan dini agar kesalahan jelas sebelum dikirim.
 */
export function LaporanDokumenImportDialog({
  open,
  onOpenChange,
  tahunDefault,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tahunDefault: number;
}) {
  const [baris, setBaris] = useState<BarisImpor[]>([]);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jenisDefault = LAPORAN_TIPE_OPTIONS[0]?.value ?? "";

  function tambahBerkas(files: FileList | null) {
    if (!files || files.length === 0) return;
    const tambahan: BarisImpor[] = Array.from(files).map((file) => ({
      file,
      judul: judulDariNamaBerkas(file.name),
      jenis: jenisDefault,
      tahun: tahunDefault,
      semester: SEMESTER_OPTIONS[0]?.value ?? 1,
    }));
    setBaris((prev) => [...prev, ...tambahan].slice(0, MAKS_DOKUMEN_IMPOR));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function ubahBaris(index: number, patch: Partial<BarisImpor>) {
    setBaris((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function hapusBaris(index: number) {
    setBaris((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (baris.length === 0) {
      toast.error("Pilih minimal satu berkas.");
      return;
    }
    // Nama field harus sama dengan yang dibaca aksi server: `berkas` untuk
    // setiap berkas, lalu metadata bersufiks indeks (`judul-0`, dst.).
    const formData = new FormData();
    baris.forEach((row, idx) => {
      formData.append("berkas", row.file);
      formData.append(`judul-${idx}`, row.judul);
      formData.append(`jenis-${idx}`, row.jenis);
      formData.append(`tahun-${idx}`, String(row.tahun));
      formData.append(`semester-${idx}`, String(row.semester));
    });
    // Panggil aksi server langsung di dalam transition: FormData dirakit dari
    // state (berkas + metadata per baris), jadi tidak bisa lewat `action` form.
    setPesanError(null);
    startTransition(async () => {
      const hasil = await imporDokumenLaporanAction(createIdleActionState(), formData);
      if (hasil.status === "success") {
        toast.success(hasil.message);
        setBaris([]);
        onOpenChange(false);
        return;
      }
      setPesanError(hasil.status === "error" ? hasil.message : "Impor dokumen gagal.");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
          }}
        >
          <DialogHeader>
            <DialogTitle>Impor Dokumen Laporan</DialogTitle>
            <DialogDescription>
              Pilih beberapa berkas PDF, lalu atur metadata tiap berkas. Maksimal{" "}
              {MAKS_DOKUMEN_IMPOR} berkas sekaligus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="berkas">Berkas PDF (maks 8 MB per berkas)</Label>
              <div className="flex gap-2">
                <Input
                  id="berkas"
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => tambahBerkas(e.target.files)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Pilih
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hanya berkas PDF. Ukuran maksimal 8 MB per berkas.
              </p>
            </div>

            {baris.length > 0 ? (
              <div className="space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead className="w-40">Jenis</TableHead>
                      <TableHead className="w-24">Tahun</TableHead>
                      <TableHead className="w-24">Semester</TableHead>
                      <TableHead className="w-28">Ukuran</TableHead>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {baris.map((row, idx) => {
                      const ms = masalahBerkas(row.file);
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{idx + 1}</TableCell>
                          <TableCell>
                            <Input
                              value={row.judul}
                              onChange={(e) => ubahBaris(idx, { judul: e.target.value })}
                              className="w-full"
                              placeholder="Judul dokumen"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.jenis}
                              onValueChange={(value) => ubahBaris(idx, { jenis: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Jenis" />
                              </SelectTrigger>
                              <SelectContent>
                                {LAPORAN_TIPE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.tahun}
                              onChange={(e) => ubahBaris(idx, { tahun: Number(e.target.value) })}
                              className="w-full"
                              min={2020}
                              max={2030}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={String(row.semester)}
                              onValueChange={(value) => ubahBaris(idx, { semester: Number(value) })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semester" />
                              </SelectTrigger>
                              <SelectContent>
                                {SEMESTER_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatUkuran(row.file.size)}
                          </TableCell>
                          <TableCell>
                            {ms ? (
                              <span className="text-xs text-destructive">{ms}</span>
                            ) : (
                              <span className="text-xs text-green-600">OK</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => hapusBaris(idx)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">Belum ada berkas dipilih.</p>
            )}

            {pesanError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{pesanError}</AlertDescription>
              </Alert>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || baris.length === 0}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Impor {baris.length} Berkas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Tombol pembuka dialog impor dokumen laporan. */
export function LaporanDokumenImportButton({ tahunDefault }: { tahunDefault: number }) {
  const [open, setOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const handleOpen = () => {
    setDialogKey((k) => k + 1);
    setOpen(true);
  };
  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <FileUp className="size-4" />
        Impor Dokumen
      </Button>
      <LaporanDokumenImportDialog
        key={dialogKey}
        open={open}
        onOpenChange={setOpen}
        tahunDefault={tahunDefault}
      />
    </>
  );
}
