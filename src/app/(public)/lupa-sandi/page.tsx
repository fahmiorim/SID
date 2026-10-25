import type { Metadata } from "next";

import { LupaSandiForm } from "@/features/auth/presentation/components/lupa-sandi-form";

export const metadata: Metadata = {
  title: "Lupa Sandi",
};

export default function LupaSandiPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Lupa Sandi</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email akun Anda untuk menerima tautan reset sandi.
        </p>
      </div>
      <LupaSandiForm />
    </div>
  );
}
