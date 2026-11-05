"use client";

import { useState } from "react";

interface KomentarItem {
  id: number;
  namaPenulis: string;
  isi: string;
  createdAt: string;
}

interface KomentarFormProps {
  _desaId: number;
  onSuccess: () => void;
}

/** Form pengiriman komentar publik di halaman kontak (Fase 5 - OS-WEB-015). */
export function KomentarForm({ _desaId, onSuccess }: KomentarFormProps) {
  const [nama, setNama] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (nama.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }
    if (isi.trim().length < 5) {
      setError("Isi komentar minimal 5 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/publik/kontak/komentar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), isi: isi.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const error =
          typeof json === "object" && json !== null && "error" in json
            ? (json as { error: string }).error
            : "Gagal mengirim komentar.";
        throw new Error(error);
      }
      setNama("");
      setIsi("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="komentar-nama" className="mb-1 block text-sm font-medium">
          Nama
        </label>
        <input
          id="komentar-nama"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Anda"
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
          minLength={2}
        />
      </div>

      <div>
        <label htmlFor="komentar-isi" className="mb-1 block text-sm font-medium">
          Komentar
        </label>
        <textarea
          id="komentar-isi"
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          placeholder="Tulis komentar Anda..."
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
          minLength={5}
          maxLength={2000}
        />
        <p className="mt-1 text-xs text-muted-foreground">{isi.length}/2000 karakter</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Mengirim..." : "Kirim Komentar"}
      </button>
    </form>
  );
}

interface KomentarListProps {
  _desaId: number;
}

/** Daftar komentar publik untuk halaman kontak (Fase 5 - OS-WEB-015). */
export function KomentarList({ _desaId }: KomentarListProps) {
  const [komters, setKomters] = useState<KomentarItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadKomentar() {
    setLoading(true);
    try {
      const res = await fetch(`/api/publik/kontak/komentar?page=1&pageSize=10`);
      if (!res.ok) return;
      const json = await res.json();
      setKomters(json.daftar ?? []);
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useState(() => {
    loadKomentar();
  });

  if (loading && komters.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Memuat komentar...</p>;
  }

  if (komters.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Belum ada komentar. Jadilah yang pertama berkomentar!
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {komters.map((k) => (
        <li key={k.id} className="rounded-lg border p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{k.namaPenulis}</span>
            <time className="text-xs text-muted-foreground" dateTime={k.createdAt}>
              {new Date(k.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap">{k.isi}</p>
        </li>
      ))}
    </ul>
  );
}
