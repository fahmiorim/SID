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
  RTM_LEVEL_ANGGOTA,
  RTM_LEVEL_KEPALA,
  RTM_LEVEL_LABELS,
  rtmLevelLabel,
  type RumahTanggaListRow,
  type RumahTanggaMember,
  type RumahTanggaReferenceData,
} from "@/features/rumah-tangga/domain/rumah-tangga";
import { idleActionState } from "@/lib/action-state";

import { assignAnggotaAction, loadRumahTanggaMembersAction, removeAnggotaAction } from "../actions";

interface RumahTanggaMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: RumahTanggaReferenceData;
  rumahTangga: RumahTanggaListRow;
}

type MembersState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly members: RumahTanggaMember[] }
  | { readonly status: "error"; readonly message: string };

/** Baris anggota: tombol keluarkan (aksi mandiri, bukan bagian formulir). */
function MemberRow({ member }: { member: RumahTanggaMember }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const formData = new FormData();
    formData.set("residentId", String(member.id));

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
        <Badge variant="outline" className="text-xs">
          {rtmLevelLabel(member.level)}
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

/** Formulir penautan penduduk baru ke rumah tangga ini. */
function AssignForm({
  rtmId,
  reference,
  members,
  onAssigned,
}: {
  rtmId: number;
  reference: RumahTanggaReferenceData;
  members: RumahTanggaMember[];
  onAssigned: () => void;
}) {
  const [state, formAction, isPending] = useActionState(assignAnggotaAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onAssigned();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onAssigned]);

  const assignedIds = new Set(members.map((member) => member.id));
  const tersedia = reference.penduduk.filter((row) => !assignedIds.has(row.id));

  if (tersedia.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tidak ada penduduk lain untuk ditautkan. Daftarkan penduduk baru terlebih dahulu.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-3">
      <input type="hidden" name="rtmId" value={rtmId} />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="residentId">Penduduk</Label>
          <Select name="residentId" required>
            <SelectTrigger id="residentId" className="w-full">
              <SelectValue placeholder="Pilih penduduk" />
            </SelectTrigger>
            <SelectContent>
              {tersedia.map((row) => (
                <SelectItem key={row.id} value={String(row.id)}>
                  {row.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Tingkat</Label>
          <Select name="level" defaultValue={String(RTM_LEVEL_ANGGOTA)}>
            <SelectTrigger id="level" className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(RTM_LEVEL_KEPALA)}>
                {RTM_LEVEL_LABELS[RTM_LEVEL_KEPALA]}
              </SelectItem>
              <SelectItem value={String(RTM_LEVEL_ANGGOTA)}>
                {RTM_LEVEL_LABELS[RTM_LEVEL_ANGGOTA]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
          Tautkan
        </Button>
      </div>
    </form>
  );
}

/** Isi dialog: memuat anggota dari server, lalu menyediakan penautan. */
function MembersContent({
  rumahTangga,
  reference,
}: {
  rumahTangga: RumahTanggaListRow;
  reference: RumahTanggaReferenceData;
}) {
  const [state, setState] = useState<MembersState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await loadRumahTanggaMembersAction(rumahTangga.id);
      if (!active) return;

      setState(
        result.ok
          ? { status: "ready", members: result.members }
          : { status: "error", message: result.message },
      );
    }

    void load();
    return () => {
      active = false;
    };
  }, [rumahTangga.id, reloadKey]);

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
          Belum ada penduduk yang ditautkan ke rumah tangga ini.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-44">NIK</TableHead>
                <TableHead className="w-44">Tingkat</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.members.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AssignForm
        rtmId={rumahTangga.id}
        reference={reference}
        members={state.members}
        onAssigned={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
}

/** Dialog rincian & pengelolaan anggota sebuah rumah tangga. */
export function RumahTanggaMembersDialog({
  open,
  onOpenChange,
  reference,
  rumahTangga,
}: RumahTanggaMembersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Anggota RTM {rumahTangga.number}</DialogTitle>
          <DialogDescription>
            {rumahTangga.memberCount === 0
              ? "Belum ada anggota yang tercatat."
              : `${rumahTangga.memberCount} anggota terdaftar pada rumah tangga ini.`}
          </DialogDescription>
        </DialogHeader>

        <MembersContent rumahTangga={rumahTangga} reference={reference} />
      </DialogContent>
    </Dialog>
  );
}
