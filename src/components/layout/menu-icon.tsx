import {
  Blocks,
  Building2,
  Circle,
  House,
  Landmark,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Registri nama ikon (string dari `setting_modul.ikon`) → komponen Lucide.
 *
 * OpenSID menyimpan nama ikon sebagai teks; di sini kita memetakan hanya ikon
 * yang dikenal agar bundle tetap ramping (tree-shakeable).
 */
const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  "user-round": UserRound,
  house: House,
  map: Map,
  settings: Settings,
  "building-2": Building2,
  "user-cog": UserCog,
  "shield-check": ShieldCheck,
  blocks: Blocks,
  landmark: Landmark,
};

export function MenuIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = name ? ICONS[name] : undefined;
  return Icon ? <Icon className={className} /> : <Circle className={className} />;
}
