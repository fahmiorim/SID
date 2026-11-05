import { Inbox, Mail, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { BarisMailbox } from "../../infrastructure/mailbox-sms-repository";
import { MailboxReplyForm } from "./mailbox-reply-form";

function formatTanggal(value: Date): string {
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function KotakMasukPanel({
  mailbox,
  bisaBalas,
}: {
  mailbox: BarisMailbox[];
  bisaBalas: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="size-5" />
          Kotak masuk email
        </CardTitle>
        <CardDescription>
          Email masuk dari webhook provider dan balasan yang dikirim operator. Balasan memakai kanal
          email yang sama dengan pusat notifikasi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mailbox.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada email masuk. Atur `EMAIL_WEBHOOK_TOKEN` dan arahkan webhook provider ke
            `/api/webhook/email`.
          </p>
        ) : (
          mailbox.map((pesan) => (
            <details key={pesan.id} className="rounded-lg border p-3" open={!pesan.dibaca}>
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
                {pesan.arah === "masuk" ? <Mail className="size-4" /> : <Send className="size-4" />}
                <span className="font-medium">{pesan.subjek || "(tanpa subjek)"}</span>
                <span className="text-muted-foreground">{pesan.alamat}</span>
                <Badge variant={pesan.arah === "masuk" ? "secondary" : "outline"}>
                  {pesan.arah === "masuk" ? "Masuk" : "Keluar"}
                </Badge>
                {!pesan.dibaca ? <Badge>Baru</Badge> : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatTanggal(pesan.createdAt)}
                </span>
              </summary>
              <p className="mt-2 text-sm whitespace-pre-wrap">{pesan.isi}</p>
              {bisaBalas && pesan.arah === "masuk" ? (
                <MailboxReplyForm id={pesan.id} alamat={pesan.alamat} />
              ) : null}
            </details>
          ))
        )}
      </CardContent>
    </Card>
  );
}
