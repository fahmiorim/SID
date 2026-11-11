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
  "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function IconBox({ name, active }: { name: string | null; active: boolean }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-white/10 text-current"
          : "bg-black/[0.035] text-muted-foreground group-hover:bg-black/[0.055] group-hover:text-foreground",
      )}
    >
      <MenuIcon name={name} className="size-4" />
    </span>
  );
}

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
            childActive
              ? "bg-white text-[var(--brand)] shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-black/[0.04]"
              : "text-muted-foreground hover:bg-black/[0.035] hover:text-foreground",
          )}
        >
          <IconBox name={node.icon} active={childActive} />
          <span className="flex-1 truncate text-left">{node.label}</span>
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 opacity-60 transition-transform duration-200",
              open && "rotate-90",
            )}
          />
        </button>

        {open ? (
          <ul className="mt-1 ml-5 space-y-0.5 border-l border-black/[0.07] pl-2">
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
            ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[0_12px_24px_-16px_var(--brand)]"
            : "text-muted-foreground hover:bg-black/[0.035] hover:text-foreground",
        )}
      >
        <IconBox name={node.icon} active={active} />
        <span className="truncate">{node.label}</span>
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
