"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { KategoriFormDialog } from "./kategori-form-dialog";

/** Tombol "Tambah Kategori" beserta dialog formulirnya. */
export function KategoriCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Kategori
      </Button>

      <KategoriFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
