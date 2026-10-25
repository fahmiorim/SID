"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDtksAction } from "@/features/penduduk/presentation/actions-dtks";

export function DtksDialog({
  availableRtm,
}: {
  availableRtm: { id: number; number: string; kepalaName: string | null }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah DTKS Baru</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Data Baru DTKS</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await createDtksAction(formData);
            if ("success" in res && res.success) {
              setOpen(false);
            } else if ("error" in res) {
              const error = res.error;
              const errorMessage =
                typeof error === "string" ? error : error._form?.[0] || "Gagal membuat DTKS";
              alert(errorMessage);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih Rumah Tangga</label>
            <Select name="rtmId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih RTM" />
              </SelectTrigger>
              <SelectContent>
                {availableRtm.map((rtm) => (
                  <SelectItem key={rtm.id} value={String(rtm.id)}>
                    {rtm.number} - {rtm.kepalaName ?? "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
