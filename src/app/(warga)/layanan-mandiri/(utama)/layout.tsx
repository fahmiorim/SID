import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { verifyWargaSession } from "@/lib/dal";

/**
 * Gerbang wajib ganti PIN.
 *
 * Halaman `/layanan-mandiri/ubah-pin` sengaja berada di luar grup ini agar
 * warga yang masih memakai PIN sementara tetap dapat membuka form tersebut.
 */
export default async function WargaLayananUtamaLayout({ children }: { children: ReactNode }) {
  const user = await verifyWargaSession();

  if (user.mustChangePin) {
    redirect("/layanan-mandiri/ubah-pin");
  }

  return <>{children}</>;
}
