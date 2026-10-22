import "server-only";

import { sanitasiHtml } from "@/lib/sanitize";

/**
 * Render HTML konten ter-sanitasi (berita, halaman statis, widget).
 *
 * Sanitasi diulang di sini sebagai lapisan kedua walau action sudah
 * membersihkan saat menyimpan — data lama/impor bisa saja belum bersih.
 * `dangerouslySetInnerHTML` memakai hasil yang **sudah** dibersihkan.
 */
export function KontenHtml({ html, className }: { html: string; className?: string }) {
  const bersih = sanitasiHtml(html);
  return (
    <div
      className={className ?? "prose-desa space-y-4 text-sm leading-relaxed"}
      dangerouslySetInnerHTML={{ __html: bersih }}
    />
  );
}
