"use client";

import { AlertCircle, Calendar, Gavel, Loader2, Plus, Settings } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { type ElectionDTO } from "@/features/penduduk/domain/dpt";
import {
  deleteElectionAction,
  saveElectionAction,
} from "@/features/penduduk/presentation/actions-dpt";
import { idleActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

interface ElectionDialogProps {
  initialElections: ElectionDTO[];
  activeElection: ElectionDTO | null;
}

const STATUS_OPTIONS = [
  { value: "draf", label: "Draf", icon: Settings },
  { value: "aktif", label: "Aktif (DPT)", icon: Gavel },
  { value: "selesai", label: "Selesai", icon: Calendar },
] as const;

export function ElectionDialog({ initialElections, activeElection }: ElectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingElection, setEditingEletion] = useState<ElectionDTO | null>(null);

  const [state, formAction, isPending] = useActionState(saveElectionAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Pemilihan disimpan.");
      window.location.reload();
    }
  }, [state, formAction]);

  const [deleteState, deleteAction] = useActionState(deleteElectionAction, idleActionState);

  useEffect(() => {
    if (deleteState.status === "success") {
      toast.success(deleteState.message ?? "Pemilihan dihapus.");
      window.location.reload();
    }
  }, [deleteState, deleteAction]);

  const handleOpenCreate = () => {
    setEditingEletion(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (election: ElectionDTO) => {
    setEditingEletion(election);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus pemilihan ini? Data DPT terkait tidak terhapus.")) return;
    deleteAction({ get: () => String(id) } as unknown as FormData);
  };

  return (
    <>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Kelola Pemilihan
        </Button>
      </DialogTrigger>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingElection ? "Edit Pemilihan" : "Buat Pemilihan Baru"}</DialogTitle>
            <DialogDescription>
              Hanya satu pemilihan yang bisa aktif per desa. Pemilihan aktif menentukan tanggal
              untuk perhitungan umur DPT.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={editingElection?.id ?? ""} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="judul">Judul Pemilihan *</Label>
              <Input
                id="judul"
                name="judul"
                placeholder="Contoh: Pilkades 2024, Pemilu 2024"
                required
                value={editingElection?.judul ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" value={editingElection?.status ?? "draf"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <Icon className="mr-2 size-4" />
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tanggal">Tanggal Pemilihan *</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                required
                value={editingElection?.tanggal ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                placeholder="Catatan tambahan..."
                value={editingElection?.keterangan ?? ""}
              />
            </div>

            {state.status === "error" && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Daftar pemilihan existing */}
      {initialElections.length > 0 && (
        <div className="mt-4 rounded-lg border bg-card p-4">
          <h4 className="mb-3 font-medium">Pemilihan Tersimpan</h4>
          <div className="space-y-2">
            {initialElections.map((election) => (
              <div
                key={election.id}
                className={`flex items-center justify-between gap-2 rounded p-2 ${
                  election.status === "aktif"
                    ? "border-l-4 border-green-500 bg-green-50"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      election.status === "aktif"
                        ? "bg-green-500"
                        : election.status === "selesai"
                          ? "bg-gray-400"
                          : "bg-yellow-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{election.judul}</p>
                    <p className="text-xs text-muted-foreground">
                      {election.tanggal} ·{" "}
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs",
                          election.status === "aktif" && "bg-green-100 text-green-700",
                          election.status === "selesai" && "bg-gray-100 text-gray-700",
                          election.status === "draf" && "bg-yellow-100 text-yellow-700",
                        )}
                      >
                        {election.status === "aktif"
                          ? "Aktif"
                          : election.status === "selesai"
                            ? "Selesai"
                            : "Draf"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(election)}
                    title="Edit"
                  >
                    <Settings className="size-4" />
                  </Button>
                  {election.status !== "aktif" && election.id !== activeElection?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(election.id)}
                      className="hover-bg-destructive/10 text-destructive"
                      title="Hapus"
                    >
                      <AlertCircle className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
