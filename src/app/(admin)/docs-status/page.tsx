"use client";

import { Clipboard, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocsStatus } from "@/lib/docs-status";

async function requestDocsStatus(): Promise<DocsStatus> {
  const response = await fetch("/api/docs-status", { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as DocsStatus;
}

export default function DocsStatusPage() {
  const [status, setStatus] = useState<DocsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCopySuccess(false);
    setCopyError(null);

    try {
      setStatus(await requestDocsStatus());
    } catch {
      setStatus(null);
      setError("Status dokumentasi gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void requestDocsStatus()
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) {
          setStatus(null);
          setError("Status dokumentasi gagal dimuat.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function copyToClipboard() {
    if (!status) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(status, null, 2));
      setCopySuccess(true);
      setCopyError(null);
    } catch {
      setCopySuccess(false);
      setCopyError("Clipboard tidak tersedia di browser ini.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-4 py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Memuat status dokumentasi...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gagal memuat status</CardTitle>
          <CardDescription>{error ?? "Data status tidak tersedia."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void loadStatus()}>
            <RefreshCw data-icon="inline-start" /> Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  const parity = status.coarseParity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Status Dokumentasi</h1>
        <p className="text-muted-foreground">
          Ringkasan scope dan baseline paritas. Status resmi tetap berada di dokumen sumber.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Scope katalog" value={`${status.catalog.totalIds} ID`} detail="OS-*" />
        <SummaryCard label="Baseline penuh" value={`${parity.done}`} detail="dari 92 modul kasar" />
        <SummaryCard
          label="Baseline kasar"
          value={`${parity.percentage}%`}
          detail="bukan paritas katalog"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Baseline paritas kasar</CardTitle>
          <CardDescription>{parity.disclaimer}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <ParityCount label="Penuh" value={parity.done} tone="text-emerald-600" />
            <ParityCount label="Sebagian" value={parity.partial} tone="text-amber-600" />
            <ParityCount label="Belum ada" value={parity.notDone} tone="text-red-600" />
          </div>
          <div className="space-y-2">
            {Object.entries(parity.categories).map(([name, category]) => (
              <div key={name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{name}</span>
                  <span className="text-sm text-muted-foreground">{category.total} modul</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.done} penuh · {category.partial} sebagian · {category.notDone} belum ada
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peta sumber dokumentasi</CardTitle>
          <CardDescription>
            Diperbarui {new Date(status.generatedAt).toLocaleString("id-ID")}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status.documents.map((document) => (
            <div key={document.name} className="flex items-start gap-3 rounded-lg border p-3">
              <Clipboard className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium">{document.name}</p>
                <p className="text-sm text-muted-foreground">{document.role}</p>
                <p className="text-sm">{document.status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={copyToClipboard} disabled={copySuccess}>
          <Clipboard data-icon="inline-start" /> {copySuccess ? "Disalin" : "Salin JSON"}
        </Button>
        <Button variant="outline" asChild>
          <a href="/api/docs-status" target="_blank" rel="noreferrer">
            Lihat API Raw
          </a>
        </Button>
        {copyError ? <p className="self-center text-sm text-destructive">{copyError}</p> : null}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  );
}

function ParityCount({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
