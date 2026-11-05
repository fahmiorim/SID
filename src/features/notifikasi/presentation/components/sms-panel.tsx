import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { PercakapanSms } from "../../domain/mailbox-sms";
import type { BarisSms } from "../../infrastructure/mailbox-sms-repository";
import { SmsReplyForm } from "./sms-reply-form";

function formatTanggal(value: Date): string {
  return new Date(value).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

export function SmsPanel({
  percakapan,
  bisaBalas,
}: {
  percakapan: PercakapanSms<BarisSms>[];
  bisaBalas: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5" />
          SMS dua arah
        </CardTitle>
        <CardDescription>
          Pesan masuk dari webhook provider dan balasan operator. Atur `SMS_API_URL`, `SMS_TOKEN`,
          dan `SMS_WEBHOOK_TOKEN` untuk mengaktifkan pengiriman serta penerimaan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {percakapan.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada percakapan SMS. Arahkan webhook provider ke `/api/webhook/sms`.
          </p>
        ) : (
          percakapan.map((thread) => (
            <div key={thread.nomor} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{thread.nomor}</span>
                <Badge variant="outline">{thread.pesan.length} pesan</Badge>
                {thread.belumDibaca > 0 ? <Badge>{thread.belumDibaca} belum dibaca</Badge> : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatTanggal(thread.terakhir)}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {thread.pesan.map((pesan) => (
                  <div
                    key={pesan.id}
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      pesan.arah === "masuk" ? "bg-muted" : "ml-auto bg-primary/10 text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{pesan.isi}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pesan.arah === "masuk" ? "Masuk" : `Keluar · ${pesan.status}`} ·{" "}
                      {formatTanggal(pesan.createdAt)}
                    </p>
                  </div>
                ))}
              </div>

              {bisaBalas ? <SmsReplyForm nomor={thread.nomor} /> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
