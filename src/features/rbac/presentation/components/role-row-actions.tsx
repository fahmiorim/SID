"use client";

import { AlertCircle, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import type { RoleDTO } from "@/features/rbac/domain/grup";
import { idleActionState } from "@/lib/action-state";

import { deleteRoleAction } from "../actions";
import { RoleFormDialog } from "./role-form-dialog";

interface RoleRowActionsProps {
  role: RoleDTO;
}

export function RoleRowActions({ role }: RoleRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleDelete() {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("id", String(role.id));
      const res = await deleteRoleAction(idleActionState, fd);
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
          <DropdownMenuItem
            variant="destructive"
            disabled={role.isSystem}
            onSelect={() => setDelOpen(true)}
          >
            <Trash2 className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleFormDialog open={editOpen} onOpenChange={setEditOpen} role={role} />

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus grup?</AlertDialogTitle>
            <AlertDialogDescription>
              {role.isSystem
                ? "Grup sistem tidak dapat dihapus."
                : `Grup "${role.name}" akan dihapus.`}
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
            <Button
              variant="destructive"
              disabled={pending || role.isSystem}
              onClick={handleDelete}
            >
              {pending ? <Loader2 className="animate-spin" /> : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
