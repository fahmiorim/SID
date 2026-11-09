"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { createIdleActionState } from "@/lib/action-state";

import type { AnjunganDTO } from "../../domain/anjungan";
import {
  createAnjunganAction,
  deleteAnjunganAction,
  updateAnjunganAction,
} from "../anjungan-actions";

function HapusAnjunganButton({ item }: { item: AnjunganDTO }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    deleteAnjunganAction,
    createIdleActionState<{ id: number } | null>(),
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      // Baris baru hilang setelah toast sempat dirender, bukan sebelum efek ini.
      router.refresh();
    }
    if (state.status === "error") toast.error(state.message);
  }, [state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={item.id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        aria-label={`Hapus anjungan ${item.nama}`}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </form>
  );
}

function AnjunganFormDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AnjunganDTO | null;
}) {
  const isEdit = Boolean(item);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateAnjunganAction : createAnjunganAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Anjungan" : "Tambah Anjungan"}</DialogTitle>
          <DialogDescription>
            Kelola daftar layanan anjungan mandiri yang tersedia di kantor desa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={item?.nama ?? ""}
              placeholder="Contoh: Anjungan Surat Mandiri"
              required
            />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              defaultValue={item?.deskripsi ?? ""}
            />
            {fieldErrors?.deskripsi ? (
              <p className="text-sm text-destructive">{fieldErrors.deskripsi[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan</Label>
            <Input
              id="urutan"
              name="urutan"
              type="number"
              min={0}
              defaultValue={item?.urutan ?? 0}
            />
            {fieldErrors?.urutan ? (
              <p className="text-sm text-destructive">{fieldErrors.urutan[0]}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="aktif"
              name="aktif"
              type="checkbox"
              value="1"
              defaultChecked={item ? item.aktif === 1 : true}
              className="h-4 w-4 rounded border"
            />
            <Label htmlFor="aktif">Tampilkan di anjungan publik</Label>
          </div>

          <hr className="my-4" />

          <h3 className="text-sm font-medium">Pengaturan Kiosk (Opsional)</h3>

          <div className="space-y-2">
            <Label htmlFor="uuid">UUID (auto-generate bila kosong)</Label>
            <Input
              id="uuid"
              name="uuid"
              defaultValue={item?.uuid ?? ""}
              placeholder="Contoh: 550e8400-e29b-41d4-a716-446655440000"
            />
            {fieldErrors?.uuid ? (
              <p className="text-sm text-destructive">{fieldErrors.uuid[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              name="ipAddress"
              defaultValue={item?.ipAddress ?? ""}
              placeholder="Contoh: 192.168.1.100"
            />
            {fieldErrors?.ipAddress ? (
              <p className="text-sm text-destructive">{fieldErrors.ipAddress[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="macAddress">MAC Address</Label>
            <Input
              id="macAddress"
              name="macAddress"
              defaultValue={item?.macAddress ?? ""}
              placeholder="Contoh: 00:1A:2B:3C:4D:5E"
            />
            {fieldErrors?.macAddress ? (
              <p className="text-sm text-destructive">{fieldErrors.macAddress[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddressPortPrinter">IP Address Printer & Port</Label>
            <Input
              id="ipAddressPortPrinter"
              name="ipAddressPortPrinter"
              defaultValue={item?.ipAddressPortPrinter ?? ""}
              placeholder="Contoh: 192.168.1.200:9100"
            />
            {fieldErrors?.ipAddressPortPrinter ? (
              <p className="text-sm text-destructive">{fieldErrors.ipAddressPortPrinter[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyboard">Virtual Keyboard</Label>
            <Input
              id="keyboard"
              name="keyboard"
              type="number"
              min={0}
              max={1}
              defaultValue={item?.keyboard ?? 1}
            />
            <p className="text-xs text-muted-foreground">0 = Nonaktif, 1 = Aktif</p>
            {fieldErrors?.keyboard ? (
              <p className="text-sm text-destructive">{fieldErrors.keyboard[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orientasiLayar">Orientasi Layar</Label>
            <Input
              id="orientasiLayar"
              name="orientasiLayar"
              type="number"
              min={0}
              max={1}
              defaultValue={item?.orientasiLayar ?? 1}
            />
            <p className="text-xs text-muted-foreground">0 = Potrait, 1 = Landscape</p>
            {fieldErrors?.orientasiLayar ? (
              <p className="text-sm text-destructive">{fieldErrors.orientasiLayar[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="permohonanSuratTanpaAkun">Surat Tanpa Akun</Label>
            <Input
              id="permohonanSuratTanpaAkun"
              name="permohonanSuratTanpaAkun"
              type="number"
              min={0}
              max={1}
              defaultValue={item?.permohonanSuratTanpaAkun ?? 0}
            />
            <p className="text-xs text-muted-foreground">0 = Nonaktif, 1 = Aktif</p>
            {fieldErrors?.permohonanSuratTanpaAkun ? (
              <p className="text-sm text-destructive">{fieldErrors.permohonanSuratTanpaAkun[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue={item?.status ?? "aktif"} name="status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                <SelectItem value="perbaikan">Perbaikan</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors?.status ? (
              <p className="text-sm text-destructive">{fieldErrors.status[0]}</p>
            ) : null}
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AnjunganManager({
  items,
  canWrite,
  canManage,
}: {
  items: AnjunganDTO[];
  canWrite: boolean;
  canManage: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AnjunganDTO | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(item: AnjunganDTO) {
    setEditing(item);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Daftar Anjungan</CardTitle>
        {canWrite ? (
          <Button size="sm" onClick={bukaTambah}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anjungan
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data anjungan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Deskripsi
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Urutan
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  {canWrite || canManage ? (
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                      Aksi
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.nama}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.deskripsi || "—"}</td>
                    <td className="p-3">{item.urutan}</td>
                    <td className="p-3">
                      <Badge variant={item.aktif ? "default" : "secondary"}>
                        {item.aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    {canWrite || canManage ? (
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          {canWrite ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => bukaUbah(item)}
                              aria-label={`Ubah anjungan ${item.nama}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {canManage ? <HapusAnjunganButton item={item} /> : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <AnjunganFormDialog
        key={editing?.id ?? "baru"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
      />
    </Card>
  );
}
