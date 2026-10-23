"use client";

import { AlertCircle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { idleActionState, type ActionState, type FieldErrors } from "@/lib/action-state";

export type CmsField =
  | {
      type: "text";
      name: string;
      label: string;
      placeholder?: string;
      maxLength?: number;
      required?: boolean;
      wide?: boolean;
    }
  | {
      type: "number";
      name: string;
      label: string;
      placeholder?: string;
      min?: number;
      max?: number;
      step?: number;
      required?: boolean;
      wide?: boolean;
    }
  | {
      type: "textarea";
      name: string;
      label: string;
      placeholder?: string;
      rows?: number;
      maxLength?: number;
      wide?: boolean;
    }
  | {
      type: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      required?: boolean;
      wide?: boolean;
    }
  | { type: "checkbox"; name: string; label: string; help?: string };

export interface CmsColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface CmsAction {
  (previousState: ActionState, formData: FormData): Promise<ActionState>;
}

export interface CmsCrudManagerProps<T> {
  rows: T[];
  getRowId: (row: T) => number;
  getRowLabel: (row: T) => string;
  columns: CmsColumn<T>[];
  fields: (rows: T[], row: T | null) => CmsField[];
  getValues: (row: T | null) => Record<string, string | boolean | undefined>;
  saveAction: CmsAction;
  deleteAction: CmsAction;
  canWrite: boolean;
  canManage: boolean;
  labels: {
    add: string;
    addTitle: string;
    editTitle: string;
    formDescription: string;
    deleteTitle: string;
    deleteDescription: (label: string) => string;
    empty: string;
  };
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

function FieldControl({
  field,
  value,
  errors,
}: {
  field: CmsField;
  value: string | boolean | undefined;
  errors?: FieldErrors;
}) {
  const id = `cms-${field.name}`;
  const messages = errors?.[field.name];
  const invalid = Boolean(messages);

  if (field.type === "checkbox") {
    return (
      <div className="flex items-start gap-3 rounded-md border p-3 sm:col-span-2">
        <Checkbox
          id={id}
          name={field.name}
          defaultChecked={value === true}
          className="mt-0.5"
          aria-invalid={invalid}
        />
        <div className="space-y-1">
          <Label htmlFor={id}>{field.label}</Label>
          {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
          <FieldError messages={messages} />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${field.wide ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          name={field.name}
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          maxLength={field.maxLength}
          aria-invalid={invalid}
        />
      ) : field.type === "select" ? (
        <Select
          name={field.name}
          defaultValue={typeof value === "string" ? value : field.options[0]?.value}
          required={field.required}
        >
          <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
            <SelectValue placeholder="Pilih..." />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          name={field.name}
          type={field.type === "number" ? "number" : "text"}
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          maxLength={field.type === "text" ? field.maxLength : undefined}
          min={field.type === "number" ? field.min : undefined}
          max={field.type === "number" ? field.max : undefined}
          step={field.type === "number" ? field.step : undefined}
          required={field.required}
          aria-invalid={invalid}
        />
      )}
      <FieldError messages={messages} />
    </div>
  );
}

function CmsFormDialog<T>({
  open,
  onOpenChange,
  row,
  rows,
  fields,
  getValues,
  getRowId,
  saveAction,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: T | null;
  rows: T[];
  fields: CmsCrudManagerProps<T>["fields"];
  getValues: CmsCrudManagerProps<T>["getValues"];
  getRowId: (row: T) => number;
  saveAction: CmsAction;
  labels: CmsCrudManagerProps<T>["labels"];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const isEdit = Boolean(row);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const values = getValues(row);
  const fieldList = fields(rows, row);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? labels.editTitle : labels.addTitle}</DialogTitle>
          <DialogDescription>{labels.formDescription}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {row ? <input type="hidden" name="id" value={getRowId(row)} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {fieldList.map((field) => (
              <FieldControl
                key={field.name}
                field={field}
                value={values[field.name]}
                errors={fieldErrors}
              />
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CmsCrudManager<T>({
  rows,
  getRowId,
  getRowLabel,
  columns,
  fields,
  getValues,
  saveAction,
  deleteAction,
  canWrite,
  canManage,
  labels,
}: CmsCrudManagerProps<T>) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [confirm, setConfirm] = useState<T | null>(null);
  const [deleteState, setDeleteState] = useState<ActionState>(idleActionState);
  const [isDeleting, startDelete] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(row: T) {
    setEditing(row);
    setDialogOpen(true);
  }

  function hapus() {
    if (!confirm) return;

    const formData = new FormData();
    formData.set("id", String(getRowId(confirm)));

    startDelete(async () => {
      const state = await deleteAction(idleActionState, formData);
      setDeleteState(state);

      if (state.status === "success") {
        toast.success(state.message);
        setConfirm(null);
        router.refresh();
      }
    });
  }

  const hasActions = canWrite || canManage;

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{rows.length} data ditampilkan.</p>
            {canWrite ? (
              <Button onClick={bukaTambah}>
                <Plus className="size-4" />
                {labels.add}
              </Button>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.header} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {hasActions ? <TableHead className="w-24 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (hasActions ? 1 : 0)}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {labels.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={getRowId(row)}>
                      {columns.map((column) => (
                        <TableCell key={column.header} className={column.className}>
                          {column.cell(row)}
                        </TableCell>
                      ))}
                      {hasActions ? (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canWrite ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => bukaUbah(row)}
                                aria-label={`Ubah ${getRowLabel(row)}`}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            ) : null}
                            {canManage ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeleteState(idleActionState);
                                  setConfirm(row);
                                }}
                                aria-label={`Hapus ${getRowLabel(row)}`}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {dialogOpen ? (
        <CmsFormDialog
          key={editing ? getRowId(editing) : "baru"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          row={editing}
          rows={rows}
          fields={fields}
          getValues={getValues}
          getRowId={getRowId}
          saveAction={saveAction}
          labels={labels}
        />
      ) : null}

      <AlertDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm ? labels.deleteDescription(getRowLabel(confirm)) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteState.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{deleteState.message}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button variant="destructive" onClick={hapus} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
