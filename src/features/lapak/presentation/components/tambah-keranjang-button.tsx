"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createIdleActionState } from "@/lib/action-state";

import { addToCartAction } from "../keranjang-actions";

interface TambahKeranjangButtonProps {
  lapakId: number;
  produkId: number;
}

export function TambahKeranjangButton({ lapakId, produkId }: TambahKeranjangButtonProps) {
  const [state, formAction] = useActionState(addToCartAction, createIdleActionState());

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="lapakId" value={lapakId} />
      <input type="hidden" name="produkId" value={produkId} />
      <input type="hidden" name="jumlah" value="1" />
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Tambah ke Keranjang
      </Button>
    </form>
  );
}
