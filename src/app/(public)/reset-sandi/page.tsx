import type { Metadata } from "next";

import { ResetSandiForm } from "@/features/auth/presentation/components/reset-sandi-form";

export const metadata: Metadata = {
  title: "Atur Ulang Sandi",
};

export default function ResetSandiPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Atur Ulang Sandi</h1>
        <p className="text-sm text-muted-foreground">Buat sandi baru untuk akun Anda.</p>
      </div>
      <ResetSandiForm searchParams={searchParams} />
    </div>
  );
}
