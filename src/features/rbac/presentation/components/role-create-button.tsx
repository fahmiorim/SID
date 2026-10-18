"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { RoleFormDialog } from "./role-form-dialog";

export function RoleCreateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Grup
      </Button>
      <RoleFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
