"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { KlasifikasiFormDialog } from "./klasifikasi-form-dialog";

export function KlasifikasiCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Klasifikasi
      </Button>

      <KlasifikasiFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
