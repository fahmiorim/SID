"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createIdleActionState, type ActionState } from "@/lib/action-state";

/** Satu isian pada formulir entitas. */
export interface EntityField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  maxLength?: number;
  step?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

/** Satu kolom tabel entitas. */
export interface EntityColumn {
  key: string;
  label: string;
  format?: "number";
}

type Row = Record<string, unknown>;

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type MutateAction = (
  previousState: ActionState<{ id: number } | null>,
  formData: FormData,
) => Promise<ActionState<{ id: number } | null>>;

interface EntityManagerProps {
  entityName: string;
  addLabel: string;
  rows: Row[];
  columns: EntityColumn[];
  fields: EntityField[];
  emptyText: string;
  actions: { create: MutateAction; update: MutateAction; remove: MutateAction };
  canWrite: boolean;
  canDelete: boolean;
}

/** Nilai awal isian dari baris yang sedang diubah. */
function nilaiAwal(row: Row | null, field: EntityField): string {
  if (!row) return field.type === "number" ? "0" : "";
  const value = row[field.name];
  if (value === null || value === undefined) return "";
  return String(value);
}

function tampilkan(value: unknown, format?: "number"): string {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "number") {
    const angka = Number(value);
    return Number.isFinite(angka) ? angka.toLocaleString("id-ID") : String(value);
  }
  return String(value);
}

/**
 * Tabel + dialog CRUD generik.
 *
 * Dipakai layer peta dan data pertanahan: definisi kolom/isian dikirim dari
 * Server Component, sedangkan aksi simpan/hapus tetap Server Action berizin.
 * Setelah mutasi berhasil, `router.refresh()` memuat ulang data server.
 */
export function EntityManager({
  entityName,
  addLabel,
  rows,
  columns,
  fields,
  emptyText,
  actions,
  canWrite,
  canDelete,
}: EntityManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [isPending, startTransition] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setOpen(true);
  }

  function bukaUbah(row: Row) {
    setEditing(row);
    setOpen(true);
  }

  function simpan(formData: FormData) {
    startTransition(async () => {
      const action = editing ? actions.update : actions.create;
      const state = await action(createIdleActionState<{ id: number } | null>(), formData);

      if (state.status === "success") {
        toast.success(state.message);
        setOpen(false);
        setEditing(null);
        router.refresh();
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  function hapus(row: Row) {
    const formData = new FormData();
    formData.set("id", String(row.id));

    startTransition(async () => {
      const state = await actions.remove(createIdleActionState<{ id: number } | null>(), formData);

      if (state.status === "success") {
        toast.success(state.message);
        router.refresh();
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{entityName}</CardTitle>
        {canWrite ? (
          <Button size="sm" onClick={bukaTambah}>
            <Plus className="mr-2 size-4" />
            {addLabel}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                  {canWrite || canDelete ? (
                    <TableHead className="text-right">Aksi</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={String(row.id)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="max-w-72 truncate">
                        {tampilkan(row[column.key], column.format)}
                      </TableCell>
                    ))}
                    {canWrite || canDelete ? (
                      <TableCell className="text-right">
                        {canWrite ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => bukaUbah(row)}
                            aria-label={`Ubah ${entityName} ${String(row.id)}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => hapus(row)}
                            disabled={isPending}
                            aria-label={`Hapus ${entityName} ${String(row.id)}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Ubah ${entityName}` : `Tambah ${entityName}`}</DialogTitle>
            <DialogDescription>
              Isian bertanda wajib harus dilengkapi. Data disimpan untuk desa ini saja.
            </DialogDescription>
          </DialogHeader>

          <form key={editing ? String(editing.id) : "baru"} action={simpan} className="space-y-3">
            {editing ? <input type="hidden" name="id" value={String(editing.id)} /> : null}

            <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}
                >
                  <Label htmlFor={`${entityName}-${field.name}`}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={`${entityName}-${field.name}`}
                      name={field.name}
                      rows={2}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      defaultValue={nilaiAwal(editing, field)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={`${entityName}-${field.name}`}
                      name={field.name}
                      defaultValue={nilaiAwal(editing, field)}
                      required={field.required}
                      className={SELECT_CLASS}
                    >
                      <option value="">{field.placeholder ?? "— Tidak dipilih —"}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={`${entityName}-${field.name}`}
                      name={field.name}
                      type={field.type ?? "text"}
                      step={field.step}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      defaultValue={nilaiAwal(editing, field)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
