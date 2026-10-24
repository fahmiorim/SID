"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { BukuItemFormDialog } from "./buku-item-form-dialog";

/** Tombol "Tambah Item" pada halaman detail buku. */
export function BukuItemCreateButton({
  bukuId,
  nomorUrutAwal,
}: {
  bukuId: number;
  nomorUrutAwal: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Item
      </Button>

      <BukuItemFormDialog
        open={open}
        onOpenChange={setOpen}
        bukuId={bukuId}
        nomorUrutAwal={nomorUrutAwal}
      />
    </>
  );
}
