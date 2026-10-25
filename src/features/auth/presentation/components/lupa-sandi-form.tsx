"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LupaSandiForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setPesan(null);
    setError(null);
    setPending(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-sandi",
      });
      if (error) {
        setError("Gagal mengirim tautan reset sandi. Coba beberapa saat lagi.");
        return;
      }
      setPesan("Jika email terdaftar, tautan reset sandi telah dikirim.");
    } catch {
      setError("Gagal mengirim tautan reset sandi. Coba beberapa saat lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {pesan ? <p className="text-sm text-green-600">{pesan}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Mengirim..." : "Kirim Tautan Reset"}
      </Button>
    </form>
  );
}
