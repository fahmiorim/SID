"use client";

import { AlertCircle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  INVENTARIS_ASAL,
  INVENTARIS_KONDISI,
  INVENTARIS_KONDISI_LABELS,
  type InventarisAsal,
  type InventarisKategoriRow,
  type InventarisKondisi,
  type InventarisRow,
} from "@/features/inventaris/domain/inventaris";
import { idleActionState } from "@/lib/action-state";

import { hapusInventarisAction, saveInventarisAction } from "../actions";

interface InventarisTableRow extends InventarisRow {
  kategoriNama: string | null;
  kategoriKode: string | null;
}

interface InventarisManagerProps {
  rows: InventarisTableRow[];
  kategori: InventarisKategoriRow[];
  total: number;
  canWrite: boolean;
  canManage: boolean;
}

const ASAL_LABELS: Record<InventarisAsal, string> = {
  pembelian: "Pembelian",
  hibah: "Hibah",
  bantuan_pemerintah: "Bantuan Pemerintah",
  sumbangan: "Sumbangan",
  lainnya: "Lainnya",
};

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

function formatRupiah(value: string | null) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number) || number === 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function InventarisFormDialog({
  open,
  onOpenChange,
  row,
  kategori,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row?: InventarisTableRow | null;
  kategori: InventarisKategoriRow[];
}) {
  const router = useRouter();
  const isEdit = Boolean(row);
  const [state, formAction, isPending] = useActionState(saveInventarisAction, idleActionState);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ubah Barang Inventaris" : "Tambah Barang Inventaris"}
          </DialogTitle>
          <DialogDescription>
            Catat identitas, nilai, kondisi, dan lokasi aset desa. Kategori dapat diatur terpisah.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {row ? <input type="hidden" name="id" value={row.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="namaBarang">Nama Barang</Label>
              <Input
                id="namaBarang"
                name="namaBarang"
                defaultValue={row?.namaBarang ?? ""}
                maxLength={200}
                aria-invalid={Boolean(fieldErrors?.namaBarang)}
              />
              <FieldError messages={fieldErrors?.namaBarang} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategoriId">Kategori</Label>
              <Select
                name="kategoriId"
                defaultValue={row?.kategoriId ? String(row.kategoriId) : "none"}
              >
                <SelectTrigger id="kategoriId" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa kategori</SelectItem>
                  {kategori.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.kode} — {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.kategoriId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorInventaris">Nomor Inventaris</Label>
              <Input
                id="nomorInventaris"
                name="nomorInventaris"
                defaultValue={row?.nomorInventaris ?? ""}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kodeBarang">Kode Barang</Label>
              <Input
                id="kodeBarang"
                name="kodeBarang"
                defaultValue={row?.kodeBarang ?? ""}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merk">Merk</Label>
              <Input id="merk" name="merk" defaultValue={row?.merk ?? ""} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe</Label>
              <Input id="tipe" name="tipe" defaultValue={row?.tipe ?? ""} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                name="jumlah"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={row?.jumlah ?? "1"}
                aria-invalid={Boolean(fieldErrors?.jumlah)}
              />
              <FieldError messages={fieldErrors?.jumlah} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan</Label>
              <Input
                id="satuan"
                name="satuan"
                defaultValue={row?.satuan ?? "buah"}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hargaSatuan">Harga Satuan</Label>
              <Input
                id="hargaSatuan"
                name="hargaSatuan"
                type="number"
                min="0"
                step="0.01"
                defaultValue={row?.hargaSatuan ?? ""}
                placeholder="Opsional"
                aria-invalid={Boolean(fieldErrors?.hargaSatuan)}
              />
              <FieldError messages={fieldErrors?.hargaSatuan} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahunPembelian">Tahun Pembelian</Label>
              <Input
                id="tahunPembelian"
                name="tahunPembelian"
                type="number"
                min="1900"
                max="2100"
                defaultValue={row?.tahunPembelian ?? ""}
                placeholder="Contoh: 2024"
                aria-invalid={Boolean(fieldErrors?.tahunPembelian)}
              />
              <FieldError messages={fieldErrors?.tahunPembelian} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalPembelian">Tanggal Pembelian</Label>
              <Input
                id="tanggalPembelian"
                name="tanggalPembelian"
                type="date"
                defaultValue={row?.tanggalPembelian ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asal">Asal Barang</Label>
              <Select name="asal" defaultValue={row?.asal ?? "none"}>
                <SelectTrigger id="asal" className="w-full">
                  <SelectValue placeholder="Pilih asal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak dicatat</SelectItem>
                  {INVENTARIS_ASAL.map((asal) => (
                    <SelectItem key={asal} value={asal}>
                      {ASAL_LABELS[asal]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donatur">Donatur / Pemberi</Label>
              <Input
                id="donatur"
                name="donatur"
                defaultValue={row?.donatur ?? ""}
                maxLength={150}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kondisi">Kondisi</Label>
              <Select name="kondisi" defaultValue={row?.kondisi ?? "baik"}>
                <SelectTrigger id="kondisi" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVENTARIS_KONDISI.map((kondisi: InventarisKondisi) => (
                    <SelectItem key={kondisi} value={kondisi}>
                      {INVENTARIS_KONDISI_LABELS[kondisi]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input id="lokasi" name="lokasi" defaultValue={row?.lokasi ?? ""} maxLength={150} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spesifikasi">Spesifikasi</Label>
            <Textarea
              id="spesifikasi"
              name="spesifikasi"
              defaultValue={row?.spesifikasi ?? ""}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={row?.keterangan ?? ""}
              rows={2}
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InventarisManager({
  rows,
  kategori,
  total,
  canWrite,
  canManage,
}: InventarisManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventarisTableRow | null>(null);
  const [confirm, setConfirm] = useState<InventarisTableRow | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: InventarisTableRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusInventarisAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirm(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "Belum ada barang inventaris."
            : `Menampilkan ${rows.length} dari ${total} barang.`}
        </p>
        {canWrite ? (
          <Button type="button" onClick={bukaTambah}>
            <Plus className="size-4" />
            Tambah Barang
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Lokasi</TableHead>
              {canWrite || canManage ? <TableHead className="text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite || canManage ? 8 : 7}
                  className="h-28 text-center text-muted-foreground"
                >
                  Tambahkan barang aset desa agar bisa dicatat dan dimutasi.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{row.nomorInventaris || "-"}</TableCell>
                  <TableCell>
                    <p className="font-medium">{row.namaBarang}</p>
                    <p className="text-xs text-muted-foreground">
                      {[row.merk, row.tipe].filter(Boolean).join(" / ") || "Tanpa merk/tipe"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {row.kategoriNama ? (
                      <>
                        <p>{row.kategoriNama}</p>
                        <p className="text-xs text-muted-foreground">{row.kategoriKode}</p>
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.jumlah} {row.satuan ?? ""}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatRupiah(row.nilaiAkhir)}
                  </TableCell>
                  <TableCell>{INVENTARIS_KONDISI_LABELS[row.kondisi]}</TableCell>
                  <TableCell>{row.lokasi || "-"}</TableCell>
                  {canWrite || canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canWrite ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Ubah barang ${row.namaBarang}`}
                            onClick={() => bukaUbah(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        ) : null}
                        {canManage ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus barang ${row.namaBarang}`}
                            onClick={() => {
                              setDeleteState(idleActionState);
                              setConfirm(row);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InventarisFormDialog
        key={editing?.id ?? "baru"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        row={editing}
        kategori={kategori}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus barang ini?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{confirm?.namaBarang}&rdquo; akan dihapus dari daftar aktif. Riwayat mutasi
              tetap tersimpan.
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
