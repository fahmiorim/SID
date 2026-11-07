"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { KeranjangItemDTO } from "@/features/lapak/domain/lapak-produk";
import {
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/features/lapak/presentation/keranjang-actions";
import { createIdleActionState, type ActionState } from "@/lib/action-state";

interface KeranjangClientProps {
  items: KeranjangItemDTO[];
}

export default function KeranjangClient({ items }: KeranjangClientProps) {
  const grandTotal = items.reduce((sum, item) => sum + Number(item.produkHarga) * item.jumlah, 0);

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <KeranjangItem key={item.id} item={item} />
      ))}

      <div className="flex flex-col items-end gap-2 pt-4">
        <p className="text-lg font-bold">Total: Rp {grandTotal.toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
}

function statusMessage(state: ActionState<unknown>): string | undefined {
  if (state.status !== "idle" && "message" in state) {
    return state.message as string;
  }
  return undefined;
}

function KeranjangItem({ item }: { item: KeranjangItemDTO }) {
  const [state, updateAction, isPending] = useActionState(
    updateCartQuantityAction,
    createIdleActionState(),
  );

  const [deleteState, deleteAction] = useActionState(removeFromCartAction, createIdleActionState());

  useEffect(() => {
    const message = statusMessage(state);
    if (state.status === "success" && message) {
      toast.success(message);
    } else if (state.status === "error" && message) {
      toast.error(message);
    }
  }, [state]);

  useEffect(() => {
    const message = statusMessage(deleteState);
    if (deleteState.status === "success" && message) {
      toast.success(message);
    } else if (deleteState.status === "error" && message) {
      toast.error(message);
    }
  }, [deleteState]);

  return (
    <Card key={item.id}>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex-1">
          <h3 className="font-semibold">{item.produkNama}</h3>
          <p className="text-sm text-muted-foreground">
            Rp {Number(item.produkHarga).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form action={updateAction} className="flex items-center gap-1">
            <input type="hidden" name="id" value={String(item.id)} />
            {item.jumlah <= 1 ? (
              <input type="hidden" name="jumlah" value="0" />
            ) : (
              <input type="hidden" name="jumlah" value={String(item.jumlah - 1)} />
            )}
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isPending}
            >
              <Minus className="h-3 w-3" />
            </Button>
          </form>
          <span className="w-8 text-center font-medium">{item.jumlah}</span>
          <form action={updateAction} className="flex items-center gap-1">
            <input type="hidden" name="id" value={String(item.id)} />
            <input type="hidden" name="jumlah" value={String(item.jumlah + 1)} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isPending}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </div>

        <p className="min-w-[100px] text-right font-bold">
          Rp {(Number(item.produkHarga) * item.jumlah).toLocaleString("id-ID")}
        </p>

        <form action={deleteAction}>
          <input type="hidden" name="id" value={String(item.id)} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
