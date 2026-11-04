"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Tombol cetak buku resmi; memicu dialog cetak browser. */
export function CetakButton() {
  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      <Printer className="size-4" />
      Cetak
    </Button>
  );
}
