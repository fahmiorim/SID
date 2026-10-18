"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PendudukReferenceData } from "@/features/penduduk/domain/penduduk";

import { PendudukFormDialog } from "./penduduk-form-dialog";

/** Tombol "Tambah Penduduk" beserta dialog formulirnya. */
export function PendudukCreateButton({ reference }: { reference: PendudukReferenceData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Penduduk
      </Button>

      <PendudukFormDialog open={open} onOpenChange={setOpen} reference={reference} />
    </>
  );
}
