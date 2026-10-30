"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { PembangunanFormDialog } from "./pembangunan-form-dialog";

/** Tombol "Tambah Proyek" beserta dialog formulirnya. */
export function PembangunanCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Proyek
      </Button>

      <PembangunanFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
