"use client";

import { useEffect, useState } from "react";

interface StatistikPengunjungData {
  totalPengunjung: number;
  rataRataHarian: number;
  tren: { tanggal: string; jumlah: number }[];
}

interface StatistikPengunjungWidgetProps {
  desaId: number;
}

/** Widget statistik pengunjung untuk halaman kontak (Fase 5 - OS-WEB-015). */
export function StatistikPengunjungWidget({ desaId }: StatistikPengunjungWidgetProps) {
  const [data, setData] = useState<StatistikPengunjungData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/publik/kontak/statistik`);
        if (!res.ok) return;
        const json = await res.json();
        setData(json.stats);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [desaId]);

  if (loading) {
    return (
      <div className="h-24 animate-pulse rounded-[var(--pub-radius)] bg-muted motion-reduce:animate-none" />
    );
  }

  if (!data) {
    return null;
  }

  const maksTren = Math.max(1, ...data.tren.map((t) => t.jumlah));

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Statistik Pengunjung</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[var(--pub-radius)] border p-4 text-center">
          <p className="text-2xl font-bold">{data.totalPengunjung.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground">Total Pengunjung</p>
        </div>
        <div className="rounded-[var(--pub-radius)] border p-4 text-center">
          <p className="text-2xl font-bold">{data.rataRataHarian.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Rata-rata/Hari</p>
        </div>
      </div>
      {data.tren.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">7 Hari Terakhir</p>
          <div className="space-y-1">
            {data.tren
              .slice(0, 7)
              .reverse()
              .map((t) => (
                <div key={t.tanggal} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-muted-foreground">{t.tanggal.slice(5)}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: "var(--pub-primary)",
                        width: `${Math.min(100, (t.jumlah / maksTren) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right">{t.jumlah}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
