"use client";

import { AlertCircle, Loader2, Plus, UserMinus } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  JABATAN_KELOMPOK,
  JABATAN_LABELS,
  jabatanLabel,
  type KelompokListRow,
  type KelompokMember,
} from "@/features/kelompok/domain/kelompok";
import {
  addAnggotaAction,
  loadKelompokMembersAction,
  removeAnggotaAction,
} from "@/features/kelompok/presentation/actions";
import { idleActionState } from "@/lib/action-state";
import type { LabelOption } from "@/lib/forms";

interface AnggotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kelompok: KelompokListRow;
}

type AnggotaState =
  | { status: "loading" }
  | { status: "ready"; members: KelompokMember[]; kandidat: LabelOption[] }
  | { status: "error"; message: string };

/** Satu baris anggota dengan tombol keluarkan (aksi mandiri). */
function AnggotaRow({ kelompokId, member }: { kelompokId: number; member: KelompokMember }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const formData = new FormData();
    formData.set("kelompokId", String(kelompokId));
    formData.set("memberId", String(member.id));

    startTransition(async () => {
      const state = await removeAnggotaAction(idleActionState, formData);
      if (state.status === "success") {
        toast.success(state.message);
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{member.name}</TableCell>
      <TableCell className="tabular-nums">
        {member.nationalId ?? <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        <Badge variant={member.position === 1 ? "default" : "secondary"} className="text-xs">
          {jabatanLabel(member.position)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Keluarkan ${member.name}`}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <UserMinus className="size-4" />}
          Keluarkan
        </Button>
      </TableCell>
    </TableRow>
  );
}

/** Formulir penambahan anggota baru. */
function AddForm({
  kelompokId,
  kandidat,
  onAdded,
}: {
  kelompokId: number;
  kandidat: LabelOption[];
  onAdded: () => void;
}) {
  const [state, formAction, isPending] = useActionState(addAnggotaAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onAdded();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onAdded]);

  if (kandidat.length === 0) {
    return (
      <p className="rounded-lg border p-3 text-sm text-muted-foreground">
        Tidak ada penduduk yang belum menjadi anggota. Tambahkan data penduduk terlebih dahulu atau
        keluarkan anggota lain.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-3">
      <input type="hidden" name="kelompokId" value={kelompokId} />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="residentId">Penduduk</Label>
          <Select name="residentId" required>
            <SelectTrigger id="residentId" className="w-full">
              <SelectValue placeholder="Pilih penduduk" />
            </SelectTrigger>
            <SelectContent>
              {kandidat.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jabatan">Jabatan</Label>
          <Select name="jabatan" defaultValue="90">
            <SelectTrigger id="jabatan" className="w-full">
              <SelectValue placeholder="Pilih jabatan" />
            </SelectTrigger>
            <SelectContent>
              {JABATAN_KELOMPOK.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {JABATAN_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
          Tambah
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nomorAnggota">No. Anggota</Label>
          <Input id="nomorAnggota" name="nomorAnggota" maxLength={50} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nomorSk">No. SK Jabatan</Label>
          <Input id="nomorSk" name="nomorSk" maxLength={100} />
        </div>
      </div>

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}

/** Isi dialog: memuat anggota dari server, lalu menyediakan penambahan. */
function AnggotaContent({ kelompok }: { kelompok: KelompokListRow }) {
  const [state, setState] = useState<AnggotaState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    loadKelompokMembersAction(kelompok.id).then((result) => {
      if (!active) return;

      setState(
        result.ok
          ? {
              status: "ready",
              members: result.members ?? [],
              kandidat: result.kandidat ?? [],
            }
          : { status: "error", message: result.message ?? "Gagal memuat data." },
      );
    });

    return () => {
      active = false;
    };
  }, [kelompok.id, reloadKey]);

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat anggota…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {state.members.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Belum ada anggota pada kelompok ini.
        </p>
      ) : (
        <div className="max-h-72 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-44">NIK</TableHead>
                <TableHead className="w-32">Jabatan</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.members.map((member) => (
                <AnggotaRow key={member.id} kelompokId={kelompok.id} member={member} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddForm
        kelompokId={kelompok.id}
        kandidat={state.kandidat}
        onAdded={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
}

/** Dialog pengelolaan anggota sebuah kelompok. */
export function AnggotaDialog({ open, onOpenChange, kelompok }: AnggotaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Anggota — {kelompok.name}</DialogTitle>
          <DialogDescription>
            {kelompok.memberCount} anggota
            {kelompok.leaderName ? ` · Ketua: ${kelompok.leaderName}` : " · Ketua belum ditetapkan"}
          </DialogDescription>
        </DialogHeader>

        <AnggotaContent kelompok={kelompok} />
      </DialogContent>
    </Dialog>
  );
}
