"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type RentangUmurDTO } from "@/features/statistik/domain/rentang-umur";
import {
  createRentangUmurAction,
  deleteRentangUmurAction,
  updateRentangUmurAction,
} from "@/features/statistik/presentation/actions";
import { createIdleActionState, type ActionState } from "@/lib/action-state";

interface RentangUmurTableProps {
  canManage: boolean;
  rows: RentangUmurDTO[];
}

export function RentangUmurTable({ canManage, rows }: RentangUmurTableProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRow, setEditingRow] = useState<RentangUmurDTO | null>(null);

  const [createState, createAction] = useActionState<ActionState<{ id: number } | null>, FormData>(
    createRentangUmurAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [updateState, updateAction] = useActionState<ActionState<{ id: number } | null>, FormData>(
    updateRentangUmurAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const [deleteState, deleteAction] = useActionState<ActionState<{ id: number } | null>, FormData>(
    deleteRentangUmurAction,
    createIdleActionState<{ id: number } | null>(),
  );

  useEffect(() => {
    if (createState.status === "success") {
      toast.success(createState.message);
      setTimeout(() => {
        setOpenDialog(false);
        setEditingRow(null);
      }, 0);
      router.refresh();
    }
  }, [createState, router]);

  useEffect(() => {
    if (updateState.status === "success") {
      toast.success(updateState.message);
      setTimeout(() => {
        setOpenDialog(false);
        setEditingRow(null);
      }, 0);
      router.refresh();
    }
  }, [updateState, router]);

  useEffect(() => {
    if (deleteState.status === "success") {
      toast.success(deleteState.message);
      router.refresh();
    }
  }, [deleteState, router]);

  const handleDelete = (id: number) => {
    const formData = new FormData();
    formData.set("id", String(id));
    deleteAction(formData);
  };

  const openEdit = (row: RentangUmurDTO) => {
    setEditingRow(row);
    setOpenDialog(true);
  };

  const openCreate = () => {
    setEditingRow(null);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Rentang
        </Button>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Bawah</TableHead>
            <TableHead>Atas</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="w-24">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.nama}</TableCell>
              <TableCell>{row.dari}</TableCell>
              <TableCell>{row.sampai ?? "∞"}</TableCell>
              <TableCell>{row.status ? "Aktif" : "Nonaktif"}</TableCell>
              {canManage && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground">
                Belum ada rentang umur. Klik &quot;Tambah Rentang&quot; untuk menambahkan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRow ? "Ubah Rentang Umur" : "Tambah Rentang Umur"}</DialogTitle>
            <DialogDescription>
              {editingRow
                ? `Ubah rentang umur ${editingRow.nama}.`
                : "Tambah rentang umur baru untuk statistik penduduk."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingRow ? (
              <form action={updateAction}>
                <input type="hidden" name="id" defaultValue={editingRow.id} />
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Rentang</Label>
                  <Input id="nama" name="nama" defaultValue={editingRow.nama} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dari">Batas Bawah</Label>
                  <Input
                    id="dari"
                    name="dari"
                    type="number"
                    min="0"
                    defaultValue={editingRow.dari}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sampai">Batas Atas (kosong = tanpa batas)</Label>
                  <Input
                    id="sampai"
                    name="sampai"
                    type="number"
                    min="0"
                    defaultValue={editingRow.sampai ?? ""}
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            ) : (
              <form action={createAction}>
                <div className="space-y-2">
                  <Label htmlFor="nama-create">Nama Rentang</Label>
                  <Input id="nama-create" name="nama" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dari-create">Batas Bawah</Label>
                  <Input
                    id="dari-create"
                    name="dari"
                    type="number"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sampai-create">Batas Atas (kosong = tanpa batas)</Label>
                  <Input id="sampai-create" name="sampai" type="number" min="0" />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
