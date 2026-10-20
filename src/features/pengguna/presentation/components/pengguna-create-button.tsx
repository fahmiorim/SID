"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { RoleOption } from "@/features/pengguna/domain/pengguna";

import { PenggunaFormDialog } from "./pengguna-form-dialog";

export function PenggunaCreateButton({ roles }: { roles: RoleOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Pengguna
      </Button>

      <PenggunaFormDialog open={open} onOpenChange={setOpen} roles={roles} />
    </>
  );
}
