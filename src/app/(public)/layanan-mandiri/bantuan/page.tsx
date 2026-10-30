import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bantuan Warga",
};

export default function LayananBantuanPage() {
  return (
    <div className="mx-auto max-w-4xl py-12">
      <h1 className="mb-6 text-2xl font-bold">Bantuan Warga</h1>
      <p className="text-sm text-muted-foreground">Informasi program bantuan untuk warga.</p>
    </div>
  );
}
