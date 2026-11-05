"use client";

import { GripVertical, Loader2, SlidersHorizontal } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createIdleActionState } from "@/lib/action-state";

import type { ShortcutItem } from "../../application/shortcut-use-cases";
import { simpanShortcutAction } from "../shortcut-actions";

/** Dialog pemilihan pintasan beranda (maksimal enam tujuan) dengan drag-and-drop urutan. */
export function ShortcutPicker({
  pilihan,
  terpilih,
}: {
  pilihan: ShortcutItem[];
  terpilih: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    simpanShortcutAction,
    createIdleActionState<number>(),
  );
  const [ordered, setOrdered] = useState<string[]>(terpilih);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  // Gunakan key pada DialogContent untuk reset ordered saat terpilih berubah
  // Hindari useEffect setState yang memicu cascading renders
  function handleDragStart(e: React.DragEvent, href: string) {
    e.dataTransfer.setData("text/plain", href);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragStart(e: React.DragEvent, href: string) {
    e.dataTransfer.setData("text/plain", href);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, targetHref: string) {
    e.preventDefault();
    const draggedHref = e.dataTransfer.getData("text/plain");
    if (!draggedHref || draggedHref === targetHref) return;

    setOrdered((prev) => {
      const idx = prev.indexOf(draggedHref);
      const targetIdx = prev.indexOf(targetHref);
      if (idx === -1 || targetIdx === -1) return prev;

      const next = [...prev];
      next.splice(idx, 1);
      next.splice(targetIdx, 0, draggedHref);
      return next;
    });
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const href = e.target.value;
    setOrdered((prev) => {
      if (e.target.checked) {
        return [...prev, href];
      }
      return prev.filter((h) => h !== href);
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 size-4" />
          Atur shortcut
        </Button>
      </DialogTrigger>

      <DialogContent
        key={`shortcut-dialog-${terpilih.join(",")}`}
        className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Atur shortcut beranda</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pilih hingga enam menu yang sering Anda pakai. Seret untuk mengurutkan. Bila tidak ada
            yang dipilih, beranda memakai tiga menu pertama.
          </p>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {pilihan.map((item) => {
              const isSelected = ordered.includes(item.href);
              return (
                <div
                  key={item.href}
                  className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                    isSelected ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                  draggable={isSelected}
                  onDragStart={(e) => handleDragStart(e, item.href)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.href)}
                >
                  {isSelected && (
                    <button
                      type="button"
                      className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                      aria-label="Seret untuk mengubah urutan"
                    >
                      <GripVertical className="size-4" />
                    </button>
                  )}
                  <Checkbox
                    id={`shortcut-${item.href}`}
                    name="href"
                    value={item.href}
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                  />
                  <Label
                    htmlFor={`shortcut-${item.href}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {item.label}
                    <span className="ml-2 text-xs text-muted-foreground">{item.href}</span>
                  </Label>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Simpan shortcut
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
