"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { BantuanFormDialog } from "./bantuan-form-dialog";

/** Tombol "Tambah Program" beserta dialog formulirnya. */
export function BantuanCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Program
      </Button>

      <BantuanFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
