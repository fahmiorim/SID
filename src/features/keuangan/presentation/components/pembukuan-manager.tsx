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
import {
  PEMBUKUAN_JENIS,
  PEMBUKUAN_JENIS_LABELS,
  type PembukuanBaris,
} from "@/features/keuangan/domain/pembukuan";
import { idleActionState } from "@/lib/action-state";

import { hapusTransaksiAction, simpanTransaksiAction } from "../pembukuan-actions";

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

function TransaksiFormDialog({
  open,
  onOpenChange,
  today,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  today: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(simpanTransaksiAction, idleActionState);
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
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Catatan kas masuk atau keluar di luar pagu APBDes. Angka ini tidak mengubah anggaran.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={today}
                aria-invalid={Boolean(fieldErrors?.tanggal)}
              />
              <FieldError messages={fieldErrors?.tanggal} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis</Label>
              <Select name="jenis" defaultValue="pendapatan">
                <SelectTrigger id="jenis" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PEMBUKUAN_JENIS.map((jenis) => (
                    <SelectItem key={jenis} value={jenis}>
                      {PEMBUKUAN_JENIS_LABELS[jenis]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.jenis} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Input
              id="keterangan"
              name="keterangan"
              maxLength={255}
              placeholder="Contoh: Penjualan lapak pasar desa"
              aria-invalid={Boolean(fieldErrors?.keterangan)}
            />
            <FieldError messages={fieldErrors?.keterangan} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah (Rp)</Label>
            <Input
              id="jumlah"
              name="jumlah"
              type="number"
              min={0.01}
              step="0.01"
              inputMode="decimal"
              placeholder="0"
              aria-invalid={Boolean(fieldErrors?.jumlah)}
            />
            <FieldError messages={fieldErrors?.jumlah} />
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

export function PembukuanManager({
  rows,
  canWrite,
  canManage,
  today,
}: {
  rows: PembukuanBaris[];
  canWrite: boolean;
  canManage: boolean;
  today: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState<PembukuanBaris | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusTransaksiAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirm(null);
        router.refresh();
      }
    });
  }

  const kolomAksi = canManage;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length === 0 ? "Belum ada transaksi." : `${rows.length} transaksi tercatat.`}
        </p>
        {canWrite ? (
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Tambah Transaksi
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              {kolomAksi ? <TableHead className="text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={kolomAksi ? 5 : 4}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Belum ada transaksi. Tambahkan catatan kas masuk atau keluar desa.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap tabular-nums">{row.tanggal}</TableCell>
                  <TableCell className="min-w-56">{row.keterangan}</TableCell>
                  <TableCell>
                    <Badge variant={row.jenis === "pendapatan" ? "secondary" : "outline"}>
                      {PEMBUKUAN_JENIS_LABELS[row.jenis]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.jenis === "belanja" ? "−" : ""}
                    {formatRupiah(row.jumlah)}
                  </TableCell>
                  {kolomAksi ? (
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus transaksi ${row.keterangan}`}
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

      <TransaksiFormDialog
        key="baru"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        today={today}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi &ldquo;{confirm?.keterangan}&rdquo; akan dihapus permanen dari buku kas
              manual desa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteState.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{deleteState.message}</AlertDescription>
            </Alert>
          ) : null}

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
