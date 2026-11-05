"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIdleActionState } from "@/lib/action-state";

import { kirimNotifikasiManualAction } from "../notifikasi-actions";

export function BroadcastForm() {
  const [state, formAction, isPending] = useActionState(
    kirimNotifikasiManualAction,
    createIdleActionState<{ sukses: boolean; dilewati: boolean } | null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kirim notifikasi manual</CardTitle>
        <CardDescription>
          Setiap percobaan dicatat pada riwayat di bawah, termasuk yang dilewati karena provider
          belum dikonfigurasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kanal">Kanal</Label>
              <select
                id="kanal"
                name="kanal"
                defaultValue="whatsapp"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Tujuan</Label>
              <Input id="target" name="target" placeholder="08xxxxxxxxxx atau email@contoh.id" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjek">Subjek (opsional, untuk email)</Label>
            <Input id="subjek" name="subjek" maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pesan">Pesan</Label>
            <textarea
              id="pesan"
              name="pesan"
              rows={4}
              maxLength={1000}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Kirim
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
