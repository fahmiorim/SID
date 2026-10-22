"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SyaratFormDialog } from "./syarat-form-dialog";

export function SyaratCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Syarat
      </Button>

      <SyaratFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
