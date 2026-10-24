import {
  FileText,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { verifyWargaSession } from "@/lib/dal";

const NAV = [
  { href: "/layanan-mandiri/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/layanan-mandiri/surat", label: "Ajukan Surat", icon: FileText },
  { href: "/layanan-mandiri/dokumen", label: "Dokumen", icon: FolderOpen },
  { href: "/layanan-mandiri/pesan", label: "Pesan", icon: MessageSquare },
  { href: "/layanan-mandiri/profil", label: "Profil", icon: UserRound },
] as const;

/**
 * Kerangka area warga.
 *
 * Identitas warga selalu berasal dari sesi (`residentId`), bukan dari URL atau
 * input klien. `verifyWargaSession` juga menolak akun staf.
 */
export default async function WargaLayout({ children }: { children: ReactNode }) {
  const user = await verifyWargaSession();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="mr-auto flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-sm leading-tight font-semibold">Layanan Mandiri</p>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/layanan-mandiri/ubah-pin">
              <KeyRound className="size-4" />
              Ubah PIN
            </Link>
          </Button>

          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" />
              Keluar
            </Button>
          </form>
        </div>

        <nav className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {NAV.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
