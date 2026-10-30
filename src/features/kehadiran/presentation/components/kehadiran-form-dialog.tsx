"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
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
import type { KehadiranDTO } from "@/features/kehadiran/domain/kehadiran";
import { createIdleActionState } from "@/lib/action-state";

import {
  createKehadiranAction,
  deleteKehadiranAction,
  updateKehadiranAction,
} from "../kehadiran-actions";

// TODO: replace with actual perangkat list from server
const dummyPerangkatList = [
  { id: 1, nama: "Kepala Desa" },
  { id: 2, nama: "Sekretaris Desa" },
  { id: 3, nama: "Kaur Keuangan" },
];

interface KehadiranFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: KehadiranDTO | null;
}

export function KehadiranFormDialog({ open, onOpenChange, item }: KehadiranFormDialogProps) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateKehadiranAction : createKehadiranAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteKehadiranAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (deleteState.status === "success") {
      toast.success(deleteState.message);
      onOpenChange(false);
    }
  }, [deleteState, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Kehadiran" : "Tambah Kehadiran"}</DialogTitle>
          <DialogDescription>Kelola data kehadiran perangkat desa</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEdit && item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="perangkatId">Perangkat</Label>
            <Select name="perangkatId" defaultValue={String(item?.perangkatId ?? "")} required>
              <SelectTrigger id="perangkatId">
                <SelectValue placeholder="Pilih Perangkat" />
              </SelectTrigger>
              <SelectContent>
                {dummyPerangkatList.map((perangkat) => (
                  <SelectItem key={perangkat.id} value={String(perangkat.id)}>
                    {perangkat.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.perangkatId ? (
              <p className="text-sm text-destructive">{fieldErrors.perangkatId[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              defaultValue={item?.tanggal ?? new Date().toISOString().split("T")[0]}
              required
            />
            {fieldErrors?.tanggal ? (
              <p className="text-sm text-destructive">{fieldErrors.tanggal[0]}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jamMasuk">Jam Masuk</Label>
              <Input
                id="jamMasuk"
                name="jamMasuk"
                type="time"
                defaultValue={item?.jamMasuk ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jamKeluar">Jam Keluar</Label>
              <Input
                id="jamKeluar"
                name="jamKeluar"
                type="time"
                defaultValue={item?.jamKeluar ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={item?.status ?? "hadir"}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="alpa">Alpa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-between">
            {isEdit && item ? (
              <form action={deleteAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" variant="destructive" disabled={isDeletePending}>
                  {isDeletePending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </Button>
              </form>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
