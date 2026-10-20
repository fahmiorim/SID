"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LaporanPrintButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      <Printer className="size-4" />
      Cetak
    </Button>
  );
}
