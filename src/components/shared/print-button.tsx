"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Tombol cetak browser yang aman dipakai dari Server Component. */
export function PrintButton({ label = "Cetak" }: { label?: string }) {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      <Printer className="size-4" />
      {label}
    </Button>
  );
}
