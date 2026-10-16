"use client";

import { Landmark, LogOut, Menu as MenuIcon, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
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
    <div className="flex items-center gap-2.5 px-3 py-1">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Landmark className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{desa.nama}</p>
        <p className="truncate text-xs text-muted-foreground">{APP_NAME}</p>
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
    <div className="flex h-full flex-col gap-4 py-4">
      <Brand desa={desa} />
      <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto px-2" onClick={onNavigate}>
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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenSidebar}
        aria-label="Buka menu"
      >
        <MenuIcon className="size-5" />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
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
      <aside className="hidden w-72 shrink-0 border-r bg-sidebar md:block">
        <Sidebar menu={menu} desa={desa} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigasi utama</SheetTitle>
          <SheetDescription className="sr-only">
            Pilih menu untuk berpindah halaman.
          </SheetDescription>
          <Sidebar menu={menu} desa={desa} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
