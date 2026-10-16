"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MenuIcon } from "@/components/layout/menu-icon";
import type { MenuNode } from "@/features/navigation/application/build-menu";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, url: string | null): boolean {
  if (!url) return false;
  return pathname === url || pathname.startsWith(`${url}/`);
}

const itemBase =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function NavItem({ node }: { node: MenuNode }) {
  const pathname = usePathname();
  const hasChildren = node.children.length > 0;
  const childActive = node.children.some((child) => isActivePath(pathname, child.url));
  const [open, setOpen] = useState(childActive);

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={cn(
            itemBase,
            "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <MenuIcon name={node.icon} className="size-4 shrink-0" />
          <span className="flex-1 text-left">{node.label}</span>
          <ChevronRight
            className={cn("size-4 shrink-0 transition-transform", open && "rotate-90")}
          />
        </button>

        {open ? (
          <ul className="mt-1 ml-4 space-y-1 border-l border-border pl-2">
            {node.children.map((child) => (
              <NavItem key={child.id} node={child} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  const active = isActivePath(pathname, node.url);

  return (
    <li>
      <Link
        href={node.url ?? "#"}
        aria-current={active ? "page" : undefined}
        className={cn(
          itemBase,
          active
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <MenuIcon name={node.icon} className="size-4 shrink-0" />
        <span>{node.label}</span>
      </Link>
    </li>
  );
}

/** Daftar navigasi utama (client: butuh `usePathname` untuk status aktif). */
export function SidebarNav({ items }: { items: MenuNode[] }) {
  if (items.length === 0) {
    return <p className="px-3 text-sm text-muted-foreground">Belum ada menu yang tersedia.</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <NavItem key={item.id} node={item} />
      ))}
    </ul>
  );
}
