import type { ReactNode } from "react";

/**
 * Layout grup rute publik (halaman masuk).
 * Menengahkan konten secara vertikal & horizontal.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
