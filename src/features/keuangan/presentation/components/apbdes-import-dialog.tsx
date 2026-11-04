"use client";

import { AlertCircle, Check, FileUp, Loader2 } from "lucide-react";
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
  DialogTrigger,
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
  imporApbdesAction,
  validateApbdesFileAction,
} from "@/features/keuangan/application/apbdes-import-use-cases";
import type {
  ApbdesImportResult,
  ApbdesValidationResult,
} from "@/features/keuangan/domain/apbdes-import";
import { createIdleActionState } from "@/lib/action-state";

interface ApbdesImportDialogProps {
  tahunDefault: number;
  tahunList: number[];
}

export function ApbdesImportDialog({ tahunDefault, tahunList }: ApbdesImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [tahun, setTahun] = useState(String(tahunDefault));
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"select" | "preview" | "importing" | "result">("select");
  const [validationResults, setValidationResults] = useState<ApbdesValidationResult[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [importResult, setImportResult] = useState<ApbdesImportResult | null>(null);
  const [pending, setPending] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tahun", tahun);

    setPending(true);
    const res = await validateApbdesFileAction(createIdleActionState(), formData);
    setPending(false);

    if (res.status === "success") {
      setValidationResults(res.data.results);
      setValidCount(res.data.validCount);
      setErrorCount(res.data.errorCount);
      setStep("preview");
    } else if (res.status === "error") {
      toast.error(res.message);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setPending(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tahun", tahun);

    const res = await imporApbdesAction(createIdleActionState(), formData);
    setPending(false);

    if (res.status === "success") {
      toast.success(res.message);
      setImportResult(res.data);
      setStep("result");
    } else if (res.status === "error") {
      toast.error(res.message);
      setStep("preview");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setStep("select");
    setValidationResults([]);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 size-4" />
          Impor APBDes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impor APBDes (Excel / CSV)</DialogTitle>
          <DialogDescription>
            Unggah file APBDes untuk memperbarui atau menambahkan pagu anggaran per rekening.
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun Anggaran</Label>
              <Select value={tahun} onValueChange={setTahun}>
                <SelectTrigger id="tahun">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {tahunList.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File APBDes (.xlsx, .xls, .csv)</Label>
              <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">
                Maksimal 10 MB. Gunakan template standar untuk format yang benar.
              </p>
            </div>

            {pending && (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Memvalidasi file...
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hasil Validasi File:</span>
              <div className="flex gap-2">
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {validCount} Valid
                </span>
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {errorCount} Error
                </span>
              </div>
            </div>

            {errorCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Ditemukan beberapa kesalahan pada file. Baris dengan kesalahan akan dilewati atau
                  menyebabkan impor gagal.
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-60 overflow-y-auto rounded border text-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.slice(0, 50).map((res, i) => (
                    <TableRow key={i} className={!res.valid ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{res.row.kode_rekening}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{res.row.nama}</TableCell>
                      <TableCell>
                        {res.valid ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Check className="size-3" /> Valid
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {res.errors.join("; ")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {validationResults.length > 50 && (
                <p className="p-2 text-center text-xs text-muted-foreground">
                  Menampilkan 50 dari {validationResults.length} baris
                </p>
              )}
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Memproses impor APBDes...</p>
            <p className="text-xs text-muted-foreground">Mohon tidak menutup jendela ini.</p>
          </div>
        )}

        {step === "result" && importResult && (
          <div className="space-y-4 py-4">
            <Alert
              variant="default"
              className="border-green-200 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-300"
            >
              <Check className="size-4 text-green-600" />
              <AlertDescription>
                Berhasil mengimpor {importResult.success} baris rekening ke APBDes Tahun {tahun}.
              </AlertDescription>
            </Alert>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Detail kesalahan ({importResult.errors.length} baris):
                </span>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded border bg-muted/50 p-2 font-mono text-xs">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="text-red-600 dark:text-red-400">
                      Baris {err.row} ({err.kode_rekening}): {err.errors.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "select" && (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Batal
              </Button>
              <Button onClick={handleValidate} disabled={!file || pending}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Lanjutkan Validasi
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="ghost" onClick={() => setStep("select")}>
                Kembali
              </Button>
              <Button
                onClick={handleImport}
                disabled={!validationResults.length || validCount === 0 || pending}
              >
                {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Impor Sekarang ({validCount} Baris)
              </Button>
            </>
          )}

          {step === "result" && <Button onClick={handleClose}>Selesai</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
