"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  keluargaLabel,
  type KeluargaListRow,
  type KeluargaMember,
} from "@/features/keluarga/domain/keluarga";
import { calculateAge, GENDER_LABELS } from "@/features/penduduk/domain/penduduk";

import { loadKeluargaMembersAction } from "../actions";

interface KeluargaMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keluarga: KeluargaListRow;
}

type MembersState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly members: KeluargaMember[] }
  | { readonly status: "error"; readonly message: string };

/** Isi dialog: memuat anggota dari server saat pertama kali ditampilkan. */
function MembersTable({ familyId }: { familyId: number }) {
  const [state, setState] = useState<MembersState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await loadKeluargaMembersAction(familyId);
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
  }, [familyId]);

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

  if (state.members.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Belum ada penduduk yang ditautkan ke Kartu Keluarga ini.
      </p>
    );
  }

  const today = new Date();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead className="w-44">NIK</TableHead>
            <TableHead className="w-40">Hubungan</TableHead>
            <TableHead className="w-16">Usia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.members.map((member) => {
            const age = calculateAge(member.birthDate, today);

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <span className="flex flex-wrap items-center gap-2">
                    {member.name}
                    <Badge variant="outline" className="text-xs">
                      {GENDER_LABELS[member.gender]}
                    </Badge>
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">
                  {member.nationalId ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {member.relationName ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="tabular-nums">
                  {age === null ? <span className="text-muted-foreground">—</span> : age}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Dialog rincian anggota sebuah Kartu Keluarga. */
export function KeluargaMembersDialog({
  open,
  onOpenChange,
  keluarga,
}: KeluargaMembersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Anggota {keluargaLabel(keluarga)}</DialogTitle>
          <DialogDescription>
            {keluarga.memberCount === 0
              ? "Belum ada anggota yang tercatat."
              : `${keluarga.memberCount} anggota terdaftar pada Kartu Keluarga ini.`}
          </DialogDescription>
        </DialogHeader>

        <MembersTable familyId={keluarga.id} />
      </DialogContent>
    </Dialog>
  );
}
