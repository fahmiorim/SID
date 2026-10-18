"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { KeluargaReferenceData } from "@/features/keluarga/domain/keluarga";

import { KeluargaFormDialog } from "./keluarga-form-dialog";

/** Tombol "Tambah Kartu Keluarga" beserta dialog formulirnya. */
export function KeluargaCreateButton({ reference }: { reference: KeluargaReferenceData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Kartu Keluarga
      </Button>

      <KeluargaFormDialog open={open} onOpenChange={setOpen} reference={reference} />
    </>
  );
}
