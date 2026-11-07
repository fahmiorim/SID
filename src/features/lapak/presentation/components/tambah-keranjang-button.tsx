"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createIdleActionState } from "@/lib/action-state";

import { addToCartAction } from "../keranjang-actions";

interface TambahKeranjangButtonProps {
  lapakId: number;
  produkId: number;
  aktif?: number | boolean;
  stok?: number | null;
}

export function TambahKeranjangButton({
  lapakId,
  produkId,
  aktif,
  stok,
}: TambahKeranjangButtonProps) {
  const [state, formAction] = useActionState(addToCartAction, createIdleActionState());

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const produkAktif = aktif === true || aktif === 1;
  const stokTersedia: number | null =
    typeof stok === "number" && Number.isFinite(stok) ? stok : null;
  const bisaDitambahkan = produkAktif && (stokTersedia === null || stokTersedia > 0);

  return (
    <form action={formAction}>
      <input type="hidden" name="lapakId" value={lapakId} />
      <input type="hidden" name="produkId" value={produkId} />
      <input type="hidden" name="jumlah" value="1" />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={!bisaDitambahkan || state.status === "success"}
      >
        {!bisaDitambahkan
          ? stokTersedia === null
            ? "Stok tidak tersedia"
            : stokTersedia === 0
              ? "Stok habis"
              : "Produk tidak tersedia"
          : state.status === "success"
            ? "Sudah ditambahkan"
            : "Tambah ke Keranjang"}
      </Button>
    </form>
  );
}
