"use client";

import { AlertCircle, Loader2, Pencil, Plus, Trash2, UserRound } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  labelStatusPerangkat,
  STATUS_PERANGKAT,
  STATUS_PERANGKAT_LABELS,
  type JabatanOption,
  type PerangkatAdmin,
} from "@/features/konten/domain/perangkat";
import { urlMedia } from "@/features/publik/domain/format";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { hapusPerangkatAction, simpanPerangkatAction } from "../perangkat-actions";

interface PerangkatManagerProps {
  perangkat: PerangkatAdmin[];
  jabatan: JabatanOption[];
  canManage: boolean;
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

/** Nama lengkap dengan gelar untuk tampilan. */
function namaLengkap(row: PerangkatAdmin): string {
  return [row.gelarDepan, row.nama, row.gelarBelakang].filter(Boolean).join(" ");
}

/** Dialog tambah/ubah perangkat. */
function PerangkatFormDialog({
  open,
  onOpenChange,
  perangkat,
  jabatan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perangkat?: PerangkatAdmin | null;
  jabatan: JabatanOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(perangkat);
  const [state, formAction, isPending] = useActionState(simpanPerangkatAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const foto = urlMedia(perangkat?.foto);

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
          <DialogTitle>{isEdit ? "Ubah Perangkat" : "Tambah Perangkat"}</DialogTitle>
          <DialogDescription>
            Data ini tampil pada halaman Pemerintahan Desa di situs publik.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {perangkat ? <input type="hidden" name="id" value={perangkat.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                name="nama"
                defaultValue={perangkat?.nama ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.nama)}
              />
              <FieldError messages={fieldErrors?.nama} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatanId">Jabatan</Label>
              <Select
                name="jabatanId"
                defaultValue={perangkat?.jabatanId ? String(perangkat.jabatanId) : NO_SELECTION}
              >
                <SelectTrigger id="jabatanId" className="w-full">
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>Tanpa jabatan</SelectItem>
                  {jabatan.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.jabatanId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gelarDepan">Gelar Depan</Label>
              <Input
                id="gelarDepan"
                name="gelarDepan"
                defaultValue={perangkat?.gelarDepan ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.gelarDepan)}
              />
              <FieldError messages={fieldErrors?.gelarDepan} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gelarBelakang">Gelar Belakang</Label>
              <Input
                id="gelarBelakang"
                name="gelarBelakang"
                defaultValue={perangkat?.gelarBelakang ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.gelarBelakang)}
              />
              <FieldError messages={fieldErrors?.gelarBelakang} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input
                id="nip"
                name="nip"
                defaultValue={perangkat?.nip ?? ""}
                maxLength={25}
                aria-invalid={Boolean(fieldErrors?.nip)}
              />
              <FieldError messages={fieldErrors?.nip} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input
                id="nik"
                name="nik"
                defaultValue={perangkat?.nik ?? ""}
                maxLength={16}
                inputMode="numeric"
                aria-invalid={Boolean(fieldErrors?.nik)}
              />
              <FieldError messages={fieldErrors?.nik} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <Select name="jenisKelamin" defaultValue={perangkat?.jenisKelamin ?? NO_SELECTION}>
                <SelectTrigger id="jenisKelamin" className="w-full">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>—</SelectItem>
                  <SelectItem value="male">Laki-laki</SelectItem>
                  <SelectItem value="female">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.jenisKelamin} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={perangkat?.status ?? "aktif"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_PERANGKAT.map((nilai) => (
                    <SelectItem key={nilai} value={nilai}>
                      {STATUS_PERANGKAT_LABELS[nilai]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.status} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempatLahir">Tempat Lahir</Label>
              <Input
                id="tempatLahir"
                name="tempatLahir"
                defaultValue={perangkat?.tempatLahir ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.tempatLahir)}
              />
              <FieldError messages={fieldErrors?.tempatLahir} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
              <Input
                id="tanggalLahir"
                name="tanggalLahir"
                type="date"
                defaultValue={perangkat?.tanggalLahir ?? ""}
                aria-invalid={Boolean(fieldErrors?.tanggalLahir)}
              />
              <FieldError messages={fieldErrors?.tanggalLahir} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urut">Urutan</Label>
              <Input
                id="urut"
                name="urut"
                type="number"
                min={0}
                max={999}
                defaultValue={perangkat?.urut ?? 0}
                aria-invalid={Boolean(fieldErrors?.urut)}
              />
              <FieldError messages={fieldErrors?.urut} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periode">Periode</Label>
              <Input
                id="periode"
                name="periode"
                defaultValue={perangkat?.periode ?? ""}
                maxLength={20}
                aria-invalid={Boolean(fieldErrors?.periode)}
              />
              <FieldError messages={fieldErrors?.periode} />
            </div>

            <div className="space-y-2 self-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="penandaTangan" defaultChecked={perangkat?.penandaTangan ?? false} />
                Penanda tangan surat
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto">Foto</Label>
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal
              <img
                src={foto}
                alt={`Foto ${perangkat?.nama ?? ""}`}
                className="size-20 rounded-full border object-cover"
              />
            ) : null}
            <Input
              id="foto"
              name="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              aria-invalid={Boolean(fieldErrors?.foto)}
            />
            <FieldError messages={fieldErrors?.foto} />
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

/** Daftar perangkat + aksi kelola. */
export function PerangkatManager({ perangkat, jabatan, canManage }: PerangkatManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PerangkatAdmin | null>(null);
  const [confirm, setConfirm] = useState<PerangkatAdmin | null>(null);
  const [deleteState, setDeleteState] = useState(idleActionState);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: PerangkatAdmin) {
    setEditing(row);
    setDialogOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(confirm.id));

    startTransition(async () => {
      const state = await hapusPerangkatAction(idleActionState, formData);
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
          {perangkat.length === 0
            ? "Belum ada perangkat terdata."
            : `${perangkat.length} perangkat terdata.`}
        </p>
        {canManage ? (
          <Button type="button" onClick={bukaTambah}>
            <Plus className="size-4" />
            Tambah Perangkat
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="w-44">Jabatan</TableHead>
              <TableHead className="w-36">NIP</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-20">Urut</TableHead>
              {canManage ? <TableHead className="w-24 text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {perangkat.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="h-28 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserRound className="size-5" />
                    <p className="text-sm">Tambahkan perangkat desa untuk melengkapi SOTK.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              perangkat.map((row) => {
                const foto = urlMedia(row.foto);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal
                        <img
                          src={foto}
                          alt={`Foto ${row.nama}`}
                          className="size-10 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full border bg-muted text-sm font-medium text-muted-foreground">
                          {(row.nama.charAt(0) || "?").toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{namaLengkap(row)}</div>
                      {row.penandaTangan ? (
                        <span className="text-xs text-muted-foreground">Penanda tangan</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{row.jabatan ?? "—"}</TableCell>
                    <TableCell>{row.nip ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status === "aktif" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {labelStatusPerangkat(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{row.urut}</TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Ubah ${row.nama}`}
                            onClick={() => bukaUbah(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus ${row.nama}`}
                            onClick={() => {
                              setDeleteState(idleActionState);
                              setConfirm(row);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PerangkatFormDialog
        key={editing?.id ?? "baru"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        perangkat={editing}
        jabatan={jabatan}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus perangkat ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Data {confirm?.nama} dan fotonya akan dihapus permanen. Jabatan tetap tersedia untuk
              perangkat lain.
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
