"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Batas galat halaman publik.
 *
 * Next.js 16 memakai prop `retry` (bukan `reset`) untuk mencoba merender ulang
 * segmen. Detail galat tidak ditampilkan ke pengunjung; hanya dicatat ke console
 * agar tidak membocorkan informasi internal.
 */
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground">Gangguan</p>
      <h1 className="text-3xl font-bold tracking-tight">Halaman gagal dimuat</h1>
      <p className="text-muted-foreground">
        Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi beberapa saat lagi.
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "var(--pub-primary)",
            color: "var(--pub-primary-foreground)",
          }}
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
