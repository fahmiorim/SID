"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className = "" }: PrintButtonProps) {
  return (
    <Button type="button" variant="outline" className={className} onClick={() => window.print()}>
      <Printer className="size-4" />
      Cetak
    </Button>
  );
}
