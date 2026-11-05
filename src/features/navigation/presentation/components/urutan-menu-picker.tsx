"use client";

import { GripVertical, ListOrdered, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createIdleActionState } from "@/lib/action-state";

import type { PilihanMenuUrutan } from "../../domain/urutan-menu";
import { simpanUrutanMenuAction } from "../urutan-menu-actions";

/**
 * Dialog pengurutan menu sidebar personal (OS-OPS-002).
 *
 * Hanya menu tingkat atas yang diurutkan; submenu tetap mengikuti urutan menu
 * yang ditetapkan admin.
 */
export function UrutanMenuPicker({
  pilihan,
  terpilih,
}: {
  pilihan: PilihanMenuUrutan[];
  terpilih: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    simpanUrutanMenuAction,
    createIdleActionState<number>(),
  );
  const [ordered, setOrdered] = useState<string[]>(terpilih);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  const labelBySlug = new Map(pilihan.map((item) => [item.slug, item.label]));

  function handleDragStart(e: React.DragEvent, slug: string) {
    e.dataTransfer.setData("text/plain", slug);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, targetSlug: string) {
    e.preventDefault();
    const draggedSlug = e.dataTransfer.getData("text/plain");
    if (!draggedSlug || draggedSlug === targetSlug) return;

    setOrdered((prev) => {
      const idx = prev.indexOf(draggedSlug);
      const targetIdx = prev.indexOf(targetSlug);
      if (idx === -1 || targetIdx === -1) return prev;

      const next = [...prev];
      next.splice(idx, 1);
      next.splice(targetIdx, 0, draggedSlug);
      return next;
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListOrdered className="mr-2 size-4" />
          Atur urutan menu
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Atur urutan menu sidebar</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seret menu untuk mengubah urutannya. Menu baru dari admin otomatis muncul di bagian
            bawah dan dapat Anda pindahkan.
          </p>

          <ul className="space-y-2">
            {ordered.map((slug) => (
              <li
                key={slug}
                className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
                draggable
                onDragStart={(e) => handleDragStart(e, slug)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slug)}
              >
                <span
                  className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                  aria-label="Seret untuk mengubah urutan"
                >
                  <GripVertical className="size-4" />
                </span>
                <span className="flex-1 text-sm">{labelBySlug.get(slug) ?? slug}</span>
                <span className="text-xs text-muted-foreground">{slug}</span>
                <input type="hidden" name="slug" value={slug} />
              </li>
            ))}
          </ul>

          <DialogFooter className="gap-2">
            <Button type="submit" name="aksi" value="reset" variant="outline" disabled={isPending}>
              Kembalikan bawaan
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Simpan urutan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
