"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ResetSandiForm({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [pending, setPending] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchParams.then((p) => setToken(p.token ?? null));
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPesan(null);
    if (password !== konfirmasi) {
      setError("Konfirmasi sandi tidak cocok.");
      return;
    }
    if (!token) {
      setError("Token reset tidak ditemukan. Minta tautan baru.");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) {
        setError("Token tidak valid atau sudah kedaluwarsa. Minta tautan baru.");
        return;
      }
      setPesan("Sandi berhasil diubah. Mengalihkan ke halaman masuk...");
      setTimeout(() => router.push("/masuk"), 1500);
    } catch {
      setError("Token tidak valid atau sudah kedaluwarsa. Minta tautan baru.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="password">Sandi Baru</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="konfirmasi">Konfirmasi Sandi</Label>
        <Input
          id="konfirmasi"
          type="password"
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          minLength={6}
          required
        />
      </div>
      {pesan ? <p className="text-sm text-green-600">{pesan}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending || !token}>
        {pending ? "Menyimpan..." : "Atur Ulang Sandi"}
      </Button>
    </form>
  );
}
