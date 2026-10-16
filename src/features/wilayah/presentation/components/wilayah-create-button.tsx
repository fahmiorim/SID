"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { WilayahFormDialog } from "./wilayah-form-dialog";

/** Tombol "Tambah Wilayah" beserta dialog formulirnya. */
export function WilayahCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Wilayah
      </Button>

      <WilayahFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
