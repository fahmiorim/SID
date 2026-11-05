"use client";

import { AlertCircle, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createIdleActionState } from "@/lib/action-state";

import type { KandidatDTO, PemilihanDTO, RekapSuara } from "../../domain/pemilihan";
import {
  hapusKandidatAction,
  loadKandidatAction,
  simpanKandidatAction,
} from "../pemilihan-actions";

interface KandidatData {
  kandidat: KandidatDTO[];
  rekap: RekapSuara;
  dptTotal: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: KandidatData }
  | { status: "error"; message: string };

/** Dialog kandidat & perolehan suara sebuah pemilihan. */
export function KandidatDialog({
  open,
  onOpenChange,
  pemilihan,
  canWrite,
  canManage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pemilihan: PemilihanDTO | null;
  canWrite: boolean;
  canManage: boolean;
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<KandidatDTO | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !pemilihan) return;
    let active = true;
    const pemilihanId = pemilihan.id;

    async function load() {
      const result = await loadKandidatAction(pemilihanId);
      if (!active) return;

      setState(
        result.ok
          ? { status: "ready", data: result.data }
          : { status: "error", message: result.message },
      );
    }

    void load();
    return () => {
      active = false;
    };
  }, [open, pemilihan, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  function simpan(formData: FormData) {
    startTransition(async () => {
      const result = await simpanKandidatAction(
        createIdleActionState<{ id: number } | null>(),
        formData,
      );

      if (result.status === "success") {
        toast.success(result.message);
        setEditing(null);
        reload();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  function hapus(item: KandidatDTO) {
    const formData = new FormData();
    formData.set("id", String(item.id));

    startTransition(async () => {
      const result = await hapusKandidatAction(
        createIdleActionState<{ id: number } | null>(),
        formData,
      );

      if (result.status === "success") {
        toast.success(result.message);
        reload();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  const data = state.status === "ready" ? state.data : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setEditing(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Kandidat — {pemilihan ? `${pemilihan.jenis} ${pemilihan.tahun}` : ""}
          </DialogTitle>
          <DialogDescription>
            Kelola kandidat, nomor urut, dan perolehan suara pemilihan ini.
          </DialogDescription>
        </DialogHeader>

        {state.status === "loading" ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Memuat kandidat…
          </div>
        ) : null}

        {state.status === "error" ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        {data ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{data.dptTotal.toLocaleString("id-ID")} pemilih (DPT)</span>
              <span>{data.rekap.totalSuara.toLocaleString("id-ID")} suara sah</span>
              <span>
                Pemenang: {data.rekap.pemenang ?? <span className="italic">belum ada</span>}
              </span>
            </div>

            {data.kandidat.length === 0 ? (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                Belum ada kandidat pada pemilihan ini.
              </p>
            ) : (
              <div className="max-h-64 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="text-right">Suara</TableHead>
                      <TableHead className="w-20 text-right">%</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rekap.rows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="tabular-nums">{item.nomorUrut}</TableCell>
                        <TableCell>
                          <p className="font-medium">{item.nama}</p>
                          {item.keterangan ? (
                            <p className="text-xs text-muted-foreground">{item.keterangan}</p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.jumlahSuara.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.percentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          {canWrite ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditing(item)}
                              aria-label={`Ubah kandidat ${item.nama}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {canManage ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => hapus(item)}
                              disabled={isPending}
                              aria-label={`Hapus kandidat ${item.nama}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {canWrite && pemilihan ? (
              <form
                key={editing?.id ?? "baru"}
                action={simpan}
                className="space-y-3 rounded-lg border p-3"
              >
                <input type="hidden" name="pemilihanId" value={pemilihan.id} />
                {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

                <div className="grid gap-3 sm:grid-cols-[80px_1fr_120px]">
                  <div className="space-y-2">
                    <Label htmlFor="nomorUrut">No. Urut</Label>
                    <Input
                      id="nomorUrut"
                      name="nomorUrut"
                      type="number"
                      min={1}
                      max={99}
                      defaultValue={editing?.nomorUrut ?? ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaKandidat">Nama</Label>
                    <Input
                      id="namaKandidat"
                      name="nama"
                      maxLength={100}
                      defaultValue={editing?.nama ?? ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlahSuara">Perolehan Suara</Label>
                    <Input
                      id="jumlahSuara"
                      name="jumlahSuara"
                      type="number"
                      min={0}
                      defaultValue={editing?.jumlahSuara ?? 0}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keteranganKandidat">Keterangan</Label>
                  <Textarea
                    id="keteranganKandidat"
                    name="keterangan"
                    rows={2}
                    maxLength={500}
                    defaultValue={editing?.keterangan ?? ""}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
                    {editing ? "Simpan Perubahan" : "Tambah Kandidat"}
                  </Button>
                  {editing ? (
                    <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                      <X className="size-4" />
                      Batal
                    </Button>
                  ) : null}
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
