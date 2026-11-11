"use client";

import { ChevronDown, Landmark, LogOut, Menu as MenuIcon, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SkipLink } from "@/components/shared/skip-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { signOutAction } from "@/features/auth/actions";
import type { MenuNode } from "@/features/navigation/application/build-menu";
import { APP_NAME } from "@/lib/app-config";

export interface ShellUser {
  name: string;
  username: string | null;
  email: string;
  roleName: string | null;
}

export interface ShellDesa {
  nama: string;
  logo: string | null;
}

function Brand({ desa }: { desa: ShellDesa }) {
  return (
    <div className="flex items-center gap-3 px-5">
      <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[0_10px_24px_-14px_var(--brand)]">
        {desa.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo diunggah dinamis
          <img src={desa.logo} alt="" className="size-full object-contain p-1.5" />
        ) : (
          <Landmark className="size-5" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Pemerintah Desa
        </p>
        <p className="mt-0.5 truncate text-sm leading-tight font-bold tracking-[-0.01em]">
          {desa.nama}
        </p>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">{APP_NAME}</p>
      </div>
    </div>
  );
}

function Sidebar({
  menu,
  desa,
  onNavigate,
}: {
  menu: MenuNode[];
  desa: ShellDesa;
  onNavigate?: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col py-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--brand)_12%,transparent),transparent_70%)]"
      />
      <Brand desa={desa} />

      <p className="mt-7 px-5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground/80 uppercase">
        Menu utama
      </p>

      <nav
        aria-label="Navigasi utama"
        className="relative mt-2 flex-1 overflow-y-auto px-3 pb-4"
        onClick={onNavigate}
      >
        <SidebarNav items={menu} />
      </nav>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function Header({ user, onOpenSidebar }: { user: ShellUser; onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/[0.06] bg-white/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-xl md:hidden"
        onClick={onOpenSidebar}
        aria-label="Buka menu"
      >
        <MenuIcon className="size-5" />
      </Button>

      <span className="truncate text-sm font-semibold md:hidden">{APP_NAME}</span>

      <div className="hidden items-center gap-2 md:flex">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full rounded-full bg-[var(--brand)] opacity-25" />
          <span className="relative inline-flex size-2 rounded-full bg-[var(--brand)]" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Ruang kerja aktif</span>
      </div>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-2 rounded-xl px-2" aria-label="Menu pengguna">
            <Avatar className="size-8 ring-2 ring-[var(--brand-soft)]">
              <AvatarFallback className="bg-[var(--brand)] text-[11px] font-semibold text-[var(--brand-foreground)]">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
              {user.name}
            </span>
            <ChevronDown
              className="hidden size-3.5 text-muted-foreground sm:block"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.username ? `@${user.username}` : user.email}
              </span>
              {user.roleName ? (
                <span className="mt-1 text-xs text-muted-foreground">{user.roleName}</span>
              ) : null}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/pengaturan/profil" className="cursor-pointer">
              <UserRound className="size-4" />
              Profil Saya
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <form action={signOutAction}>
            <DropdownMenuItem asChild variant="destructive">
              <button type="submit" className="w-full cursor-pointer">
                <LogOut className="size-4" />
                Keluar
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

/**
 * Kerangka aplikasi (admin shell): sidebar tetap di desktop, drawer di mobile,
 * header dengan menu pengguna.
 */
export function AppShell({
  menu,
  user,
  desa,
  children,
}: {
  menu: MenuNode[];
  user: ShellUser;
  desa: ShellDesa;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-svh w-full">
      <SkipLink />

      <aside className="hidden w-[17.5rem] shrink-0 overflow-hidden border-r border-black/[0.06] bg-[var(--warm-paper)] md:block">
        <Sidebar menu={menu} desa={desa} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[17.5rem] bg-[var(--warm-paper)] p-0">
          <SheetTitle className="sr-only">Navigasi utama</SheetTitle>
          <SheetDescription className="sr-only">
            Pilih menu untuk berpindah halaman.
          </SheetDescription>
          <Sidebar menu={menu} desa={desa} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} onOpenSidebar={() => setMobileOpen(true)} />
        <main
          id="konten-utama"
          tabIndex={-1}
          className="mx-auto w-full max-w-[100rem] flex-1 p-4 md:p-6 lg:p-8"
        >
          <div className="ui-fade">{children}</div>
        </main>
      </div>
    </div>
  );
}
