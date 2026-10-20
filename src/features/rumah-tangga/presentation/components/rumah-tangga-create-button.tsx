"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { RumahTanggaReferenceData } from "@/features/rumah-tangga/domain/rumah-tangga";

import { RumahTanggaFormDialog } from "./rumah-tangga-form-dialog";

/** Tombol "Tambah Rumah Tangga" beserta dialog formulirnya. */
export function RumahTanggaCreateButton({ reference }: { reference: RumahTanggaReferenceData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Rumah Tangga
      </Button>

      <RumahTanggaFormDialog open={open} onOpenChange={setOpen} reference={reference} />
    </>
  );
}
