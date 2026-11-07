"use client";

import { Loader2, MailOpen, Send } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createIdleActionState } from "@/lib/action-state";

import type { MailboxBaris } from "../../infrastructure/mailbox-repository";
import { balasPesanMailboxAction, tandaiPesanMailboxDibacaAction } from "../notifikasi-actions";

function formatTanggal(value: Date): string {
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function PesanMailbox({ pesan, bisaBalas }: { pesan: MailboxBaris; bisaBalas: boolean }) {
  const [bacaState, bacaAction, sedangMenandai] = useActionState(
    tandaiPesanMailboxDibacaAction,
    createIdleActionState(),
  );
  const [balasState, balasAction, sedangMembalas] = useActionState(
    balasPesanMailboxAction,
    createIdleActionState<{ sukses: boolean; dilewati: boolean } | null>(),
  );

  useEffect(() => {
    if (bacaState.status === "success") toast.success(bacaState.message);
    if (bacaState.status === "error") toast.error(bacaState.message);
  }, [bacaState]);

  useEffect(() => {
    if (balasState.status === "success" && balasState.tone === "warning") {
      toast.warning(balasState.message);
    } else if (balasState.status === "success") {
      toast.success(balasState.message);
    }
    if (balasState.status === "error") toast.error(balasState.message);
  }, [balasState]);

  const masuk = pesan.arah === "masuk";

  return (
    <article className="space-y-3 rounded-md border p-4">
      <header className="flex flex-wrap items-center gap-2">
        <Badge variant={masuk ? (pesan.dibaca ? "secondary" : "default") : "outline"}>
          {masuk ? (pesan.dibaca ? "Masuk · dibaca" : "Masuk · baru") : "Balasan desa"}
        </Badge>
        <span className="font-medium">{pesan.alamat}</span>
        <time className="text-sm text-muted-foreground">{formatTanggal(pesan.createdAt)}</time>
      </header>
      <h4 className="font-medium">{pesan.subjek || "(Tanpa subjek)"}</h4>
      <p className="text-sm whitespace-pre-wrap">{pesan.isi}</p>

      {masuk && !pesan.dibaca ? (
        <form action={bacaAction}>
          <input type="hidden" name="id" value={pesan.id} />
          <Button type="submit" size="sm" variant="outline" disabled={sedangMenandai}>
            {sedangMenandai ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <MailOpen className="mr-2 size-4" />
            )}
            Tandai dibaca
          </Button>
        </form>
      ) : null}

      {masuk && bisaBalas ? (
        <form action={balasAction} className="space-y-2 border-t pt-3">
          <input type="hidden" name="id" value={pesan.id} />
          <label htmlFor={`balas-${pesan.id}`} className="text-sm font-medium">
            Balas melalui email
          </label>
          <textarea
            id={`balas-${pesan.id}`}
            name="isi"
            rows={3}
            maxLength={5000}
            required
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" size="sm" disabled={sedangMembalas}>
            {sedangMembalas ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Kirim balasan
          </Button>
        </form>
      ) : null}
    </article>
  );
}

export function MailboxInbox({ pesan, bisaBalas }: { pesan: MailboxBaris[]; bisaBalas: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kotak masuk email</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pesan masuk diterima melalui webhook email; identitas desa ditentukan dari host.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {pesan.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Belum ada pesan email.</p>
        ) : (
          pesan.map((item) => <PesanMailbox key={item.id} pesan={item} bisaBalas={bisaBalas} />)
        )}
      </CardContent>
    </Card>
  );
}
