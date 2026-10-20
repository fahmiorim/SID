"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { KelompokTipe } from "@/features/kelompok/domain/kelompok";

import { KelompokFormDialog } from "./kelompok-form-dialog";

/** Tombol "Tambah Kelompok" beserta dialog formulirnya. */
export function KelompokCreateButton({ defaultTipe }: { defaultTipe?: KelompokTipe }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Kelompok
      </Button>

      <KelompokFormDialog open={open} onOpenChange={setOpen} defaultTipe={defaultTipe} />
    </>
  );
}
