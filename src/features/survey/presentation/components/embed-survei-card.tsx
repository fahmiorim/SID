"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Kartu embed formulir survei di situs pihak ketiga (OS-ANA-005). */
export function EmbedSurveiCard({
  judul,
  embedUrl,
  token,
}: {
  judul: string;
  embedUrl: string;
  token: string;
}) {
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="${embedUrl}" title="Survei ${judul.replaceAll('"', "'")}" width="100%" height="900" style="border:1px solid #ddd;border-radius:8px" loading="lazy"></iframe>`;

  async function salin() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bisa diblokir; pengguna tetap dapat menyalin manual.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Embed di Situs Lain</CardTitle>
        <CardDescription>
          Tempelkan kode iframe ini. Untuk mengirim langsung lewat API, gunakan token di bawah ke
          endpoint <code>POST /api/publik/survei/{`{id}`}/respons</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          readOnly
          value={snippet}
          rows={3}
          aria-label="Kode embed iframe survei"
          className="w-full resize-none rounded-md border bg-muted/40 p-3 font-mono text-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={salin}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Tersalin" : "Salin kode embed"}
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={embedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Buka formulir
            </a>
          </Button>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Token API (berlaku 7 hari)</p>
          <code className="block rounded-md border bg-muted/40 p-2 break-all">{token}</code>
        </div>
      </CardContent>
    </Card>
  );
}
