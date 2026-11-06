"use client";

import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { idleActionState } from "@/lib/action-state";

import { hapusJurnalAction, simpanJurnalAction, simpanSaldoBankAction } from "../jurnal-actions";

/** Baris jurnal yang dikirim halaman ke klien (tanpa kolom audit). */
export interface JurnalBaris {
  id: number;
  tahun: number;
  tanggal: string;
  kodeRekening: string;
  uraian: string;
  debet: string;
  kredit: string;
  sumber: string;
  referensi: string | null;
}

/** Baris saldo awal rekening bank. */
export interface SaldoBankBaris {
  id: number;
  tahun: number;
  rekeningBank: string;
  namaBank: string;
  saldoAwal: string;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

function DialogAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function JurnalFormDialog({
  open,
  onOpenChange,
  tahun,
  today,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tahun: number;
  today: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(simpanJurnalAction, idleActionState);
  const [mutasi, setMutasi] = useState<"debet" | "kredit">("debet");
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const namaJumlah = mutasi;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Entri Jurnal</DialogTitle>
          <DialogDescription>
            Catat satu mutasi pada kode rekening. Isi debet untuk kas masuk, kredit untuk kas keluar
            — bukan keduanya.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tahun" value={tahun} />
          {state.status === "error" ? <DialogAlert message={state.message} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jurnal-tanggal">Tanggal</Label>
              <Input
                id="jurnal-tanggal"
                name="tanggal"
                type="date"
                defaultValue={today}
                aria-invalid={Boolean(fieldErrors?.tanggal)}
              />
              <FieldError messages={fieldErrors?.tanggal} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurnal-mutasi">Jenis mutasi</Label>
              <Select
                value={mutasi}
                onValueChange={(value) => setMutasi(value === "kredit" ? "kredit" : "debet")}
              >
                <SelectTrigger id="jurnal-mutasi" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debet">Debet (kas masuk)</SelectItem>
                  <SelectItem value="kredit">Kredit (kas keluar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jurnal-kode">Kode rekening</Label>
              <Input
                id="jurnal-kode"
                name="kodeRekening"
                maxLength={50}
                placeholder="Contoh: 4.1.1.01"
                aria-invalid={Boolean(fieldErrors?.kodeRekening)}
              />
              <FieldError messages={fieldErrors?.kodeRekening} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurnal-jumlah">Jumlah (Rp)</Label>
              <Input
                id="jurnal-jumlah"
                name={namaJumlah}
                type="number"
                min={0.01}
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={Boolean(fieldErrors?.debet ?? fieldErrors?.kredit)}
              />
              <input type="hidden" name={namaJumlah === "debet" ? "kredit" : "debet"} value="0" />
              <FieldError messages={fieldErrors?.debet ?? fieldErrors?.kredit} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurnal-uraian">Uraian</Label>
            <Input
              id="jurnal-uraian"
              name="uraian"
              maxLength={2000}
              placeholder="Contoh: Penerimaan retribusi pasar desa"
              aria-invalid={Boolean(fieldErrors?.uraian)}
            />
            <FieldError messages={fieldErrors?.uraian} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurnal-referensi">Referensi (opsional)</Label>
            <Input
              id="jurnal-referensi"
              name="referensi"
              maxLength={255}
              placeholder="Nomor bukti / kunci baris asal"
              aria-invalid={Boolean(fieldErrors?.referensi)}
            />
            <FieldError messages={fieldErrors?.referensi} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SaldoBankFormDialog({
  open,
  onOpenChange,
  tahun,
  awal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tahun: number;
  awal: SaldoBankBaris | null;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(simpanSaldoBankAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{awal ? "Ubah Saldo Awal" : "Tambah Rekening Bank"}</DialogTitle>
          <DialogDescription>
            Saldo awal rekening pada tahun anggaran {tahun}. Kombinasi tahun dan nomor rekening
            bersifat unik — menyimpan ulang akan memperbarui baris yang sama.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tahun" value={tahun} />
          {state.status === "error" ? <DialogAlert message={state.message} /> : null}

          <div className="space-y-2">
            <Label htmlFor="saldo-rekening">Nomor rekening</Label>
            <Input
              id="saldo-rekening"
              name="rekeningBank"
              maxLength={50}
              defaultValue={awal?.rekeningBank ?? ""}
              placeholder="Contoh: 123-45-678901-2"
              aria-invalid={Boolean(fieldErrors?.rekeningBank)}
            />
            <FieldError messages={fieldErrors?.rekeningBank} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldo-bank">Nama bank</Label>
            <Input
              id="saldo-bank"
              name="namaBank"
              maxLength={100}
              defaultValue={awal?.namaBank ?? ""}
              placeholder="Contoh: Bank Pembangunan Daerah"
              aria-invalid={Boolean(fieldErrors?.namaBank)}
            />
            <FieldError messages={fieldErrors?.namaBank} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldo-awal">Saldo awal (Rp)</Label>
            <Input
              id="saldo-awal"
              name="saldoAwal"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              defaultValue={awal?.saldoAwal ?? "0.00"}
              aria-invalid={Boolean(fieldErrors?.saldoAwal)}
            />
            <FieldError messages={fieldErrors?.saldoAwal} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function JurnalManager({
  tahun,
  rows,
  saldoBank,
  canWrite,
  canManage,
  today,
}: {
  tahun: number;
  rows: JurnalBaris[];
  saldoBank: SaldoBankBaris[];
  canWrite: boolean;
  canManage: boolean;
  today: string;
}) {
  const router = useRouter();
  const [jurnalOpen, setJurnalOpen] = useState(false);
  const [saldoOpen, setSaldoOpen] = useState(false);
  const [saldoAwal, setSaldoAwal] = useState<SaldoBankBaris | null>(null);
  const [confirm, setConfirm] = useState<JurnalBaris | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusJurnalAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirm(null);
        router.refresh();
      }
    });
  }

  function bukaSaldo(awal: SaldoBankBaris | null) {
    setSaldoAwal(awal);
    setSaldoOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Jurnal Umum</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mutasi debet/kredit per kode rekening tahun {tahun}.
            </p>
          </div>
          {canWrite ? (
            <Button type="button" onClick={() => setJurnalOpen(true)}>
              <Plus className="size-4" />
              Tambah Entri
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Tanggal</TableHead>
                  <TableHead className="w-32">Kode</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead className="w-32 text-right">Debet</TableHead>
                  <TableHead className="w-32 text-right">Kredit</TableHead>
                  {canManage ? <TableHead className="w-16 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 6 : 5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Belum ada entri jurnal pada tahun {tahun}.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {row.tanggal}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.kodeRekening}
                      </TableCell>
                      <TableCell className="min-w-56">
                        {row.uraian}
                        {row.referensi ? (
                          <span className="block text-xs text-muted-foreground">
                            Ref: {row.referensi}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.debet === "0.00" ? "—" : formatRupiah(row.debet)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.kredit === "0.00" ? "—" : formatRupiah(row.kredit)}
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus entri jurnal ${row.uraian}`}
                            onClick={() => {
                              setDeleteState(idleActionState);
                              setConfirm(row);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Saldo Awal Rekening Bank</CardTitle>
            <p className="text-sm text-muted-foreground">
              Saldo pembukaan tiap rekening pada tahun {tahun}.
            </p>
          </div>
          {canWrite ? (
            <Button type="button" variant="outline" onClick={() => bukaSaldo(null)}>
              <Plus className="size-4" />
              Tambah Rekening
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Nomor Rekening</TableHead>
                  <TableHead>Nama Bank</TableHead>
                  <TableHead className="w-40 text-right">Saldo Awal</TableHead>
                  {canWrite ? <TableHead className="w-16 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {saldoBank.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canWrite ? 4 : 3}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Belum ada saldo rekening bank pada tahun {tahun}.
                    </TableCell>
                  </TableRow>
                ) : (
                  saldoBank.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.rekeningBank}</TableCell>
                      <TableCell>{row.namaBank}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(row.saldoAwal)}
                      </TableCell>
                      {canWrite ? (
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => bukaSaldo(row)}
                          >
                            Ubah
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <JurnalFormDialog
        key={`jurnal-${tahun}`}
        open={jurnalOpen}
        onOpenChange={setJurnalOpen}
        tahun={tahun}
        today={today}
      />

      <SaldoBankFormDialog
        key={`saldo-${saldoAwal?.id ?? "baru"}-${tahun}`}
        open={saldoOpen}
        onOpenChange={setSaldoOpen}
        tahun={tahun}
        awal={saldoAwal}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus entri jurnal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Entri &ldquo;{confirm?.uraian}&rdquo; akan dihapus permanen dari jurnal umum.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteState.status === "error" ? <DialogAlert message={deleteState.message} /> : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <Button variant="destructive" onClick={hapus} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
