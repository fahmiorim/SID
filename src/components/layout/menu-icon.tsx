import {
  BarChart3,
  Blocks,
  Building2,
  Calculator,
  Circle,
  Files,
  FileSpreadsheet,
  FileText,
  House,
  Inbox,
  Landmark,
  LayoutDashboard,
  Mail,
  Map,
  Send,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Registri nama ikon (string dari `modules.icon`) → komponen Lucide.
 *
 * Nama ikon disimpan sebagai teks di basis data. Di sini hanya ikon yang dikenal
 * yang dipetakan, agar bundel tetap ramping (tree-shakeable).
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
  mail: Mail,
  "file-text": FileText,
  files: Files,
  tags: Tags,
  inbox: Inbox,
  send: Send,
  wallet: Wallet,
  calculator: Calculator,
  "bar-chart-3": BarChart3,
  "file-spreadsheet": FileSpreadsheet,
};

export function MenuIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = name ? ICONS[name] : undefined;
  return Icon ? <Icon className={className} /> : <Circle className={className} />;
}
