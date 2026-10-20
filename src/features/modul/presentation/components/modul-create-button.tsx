"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ModulOption } from "@/features/modul/domain/modul";

import { ModulFormDialog } from "./modul-form-dialog";

export function ModulCreateButton({ parents }: { parents: ModulOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Modul
      </Button>
      <ModulFormDialog open={open} onOpenChange={setOpen} parents={parents} />
    </>
  );
}
