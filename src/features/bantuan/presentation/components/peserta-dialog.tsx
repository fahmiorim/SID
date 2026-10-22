"use client";

import { AlertCircle, Loader2, Plus, UserMinus } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  SASARAN_LABELS,
  type BantuanListRow,
  type PesertaBantuanRow,
  type PesertaReferenceData,
} from "@/features/bantuan/domain/bantuan";
import { idleActionState } from "@/lib/action-state";

import { addPesertaAction, loadPesertaAction, removePesertaAction } from "../actions";

interface PesertaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: BantuanListRow;
}

type PesertaState =
  | { readonly status: "loading" }
  | {
      readonly status: "ready";
      readonly peserta: PesertaBantuanRow[];
      readonly reference: PesertaReferenceData;
    }
  | { readonly status: "error"; readonly message: string };

/** Satu baris peserta dengan tombol keluarkan (aksi mandiri). */
function PesertaRow({ programId, peserta }: { programId: number; peserta: PesertaBantuanRow }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const formData = new FormData();
    formData.set("programId", String(programId));
    formData.set("pesertaId", String(peserta.id));

    startTransition(async () => {
      const state = await removePesertaAction(idleActionState, formData);
      if (state.status === "success") {
        toast.success(state.message);
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{peserta.targetName}</TableCell>
      <TableCell className="tabular-nums">
        {peserta.cardNationalId ?? peserta.targetIdentity ?? (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {peserta.cardNumber ?? <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Keluarkan ${peserta.targetName}`}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <UserMinus className="size-4" />}
          Keluarkan
        </Button>
      </TableCell>
    </TableRow>
  );
}

/** Pilihan sasaran yang tersedia untuk program (menurut sasarannya). */
function sasaranOptions(
  reference: PesertaReferenceData,
  sasaran: number,
): { options: PesertaReferenceData["penduduk"]; judul: string } {
  if (sasaran === 2) return { options: reference.keluarga, judul: "Keluarga (KK)" };
  if (sasaran === 3) return { options: reference.rumahTangga, judul: "Rumah Tangga (RTM)" };
  if (sasaran === 4) return { options: reference.kelompok, judul: "Kelompok" };
  return { options: reference.penduduk, judul: "Penduduk" };
}

/** Formulir penambahan peserta baru. */
function AddForm({
  program,
  reference,
  onAdded,
}: {
  program: BantuanListRow;
  reference: PesertaReferenceData;
  onAdded: () => void;
}) {
  const [state, formAction, isPending] = useActionState(addPesertaAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onAdded();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onAdded]);

  const { options, judul } = sasaranOptions(reference, program.sasaran);

  if (options.length === 0) {
    return (
      <p className="rounded-lg border p-3 text-sm text-muted-foreground">
        Tidak ada {judul.toLowerCase()} yang belum menjadi peserta. Tambahkan data{" "}
        {judul.toLowerCase()} terlebih dahulu atau kosongkan peserta lain.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-3">
      <input type="hidden" name="programId" value={program.id} />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="sasaranId">{judul}</Label>
          <Select name="sasaranId" required>
            <SelectTrigger id="sasaranId" className="w-full">
              <SelectValue placeholder={`Pilih ${judul.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.label}
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

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground select-none">
          Isian kartu peserta (opsional)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomorKartu">No. Kartu</Label>
            <Input id="nomorKartu" name="nomorKartu" maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kartuNama">Nama pada Kartu</Label>
            <Input id="kartuNama" name="kartuNama" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kartuNik">NIK pada Kartu</Label>
            <Input id="kartuNik" name="kartuNik" maxLength={16} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kartuTempatLahir">Tempat Lahir</Label>
            <Input id="kartuTempatLahir" name="kartuTempatLahir" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kartuTanggalLahir">Tanggal Lahir</Label>
            <Input id="kartuTanggalLahir" name="kartuTanggalLahir" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kartuAlamat">Alamat pada Kartu</Label>
            <Input id="kartuAlamat" name="kartuAlamat" maxLength={255} />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Isian yang dikosongkan akan diambil dari data sasaran sebagai nilai awal.
        </p>
      </details>

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}

/** Isi dialog: memuat peserta dari server, lalu menyediakan penambahan. */
function PesertaContent({ program }: { program: BantuanListRow }) {
  const [state, setState] = useState<PesertaState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await loadPesertaAction(program.id);
      if (!active) return;

      setState(
        result.ok
          ? { status: "ready", peserta: result.peserta, reference: result.reference }
          : { status: "error", message: result.message },
      );
    }

    void load();
    return () => {
      active = false;
    };
  }, [program.id, reloadKey]);

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat peserta…
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
      {state.peserta.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Belum ada peserta pada program ini.
        </p>
      ) : (
        <div className="max-h-72 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sasaran</TableHead>
                <TableHead className="w-44">NIK / Identitas</TableHead>
                <TableHead className="w-40">No. Kartu</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.peserta.map((peserta) => (
                <PesertaRow key={peserta.id} programId={program.id} peserta={peserta} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddForm
        program={program}
        reference={state.reference}
        onAdded={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
}

/** Dialog pengelolaan peserta sebuah program bantuan. */
export function PesertaDialog({ open, onOpenChange, program }: PesertaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Peserta — {program.name}</DialogTitle>
          <DialogDescription>
            Sasaran {SASARAN_LABELS[program.sasaran as 1 | 2 | 3 | 4] ?? "-"} ·{" "}
            {program.pesertaCount} peserta
          </DialogDescription>
        </DialogHeader>

        <PesertaContent program={program} />
      </DialogContent>
    </Dialog>
  );
}
