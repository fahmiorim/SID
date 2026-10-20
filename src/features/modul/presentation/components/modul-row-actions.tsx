"use client";

import { AlertCircle, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
// shouldShowDelete removed - delete button visibility controlled by canManage prop
import { useState, useTransition } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ModulDTO, ModulOption } from "@/features/modul/domain/modul";
import { idleActionState } from "@/lib/action-state";

import { deleteModulAction } from "../actions";
import { ModulFormDialog } from "./modul-form-dialog";

interface ModulRowActionsProps {
  modul: ModulDTO;
  parents: ModulOption[];
  canManage: boolean;
}
export function ModulRowActions({ modul, parents, canManage }: ModulRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const parentOptions = parents.filter((p) => p.value !== String(modul.id));

  function handleDelete() {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("id", String(modul.id));
      const res = await deleteModulAction(idleActionState, fd);
      if (res.status === "success") {
        toast.success(res.message);
        setDelOpen(false);
        return;
      }
      setErr(res.status === "error" ? res.message : "Gagal menghapus.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Ubah
          </DropdownMenuItem>
          {canManage ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setDelOpen(true)}>
              <Trash2 className="size-4" />
              Hapus
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ModulFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        modul={modul}
        parents={parentOptions}
      />

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus modul?</AlertDialogTitle>
            <AlertDialogDescription>
              Modul &quot;{modul.name}&quot; akan dihapus. Hak akses terkait ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {err ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{err}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <Button variant="destructive" disabled={pending} onClick={handleDelete}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
