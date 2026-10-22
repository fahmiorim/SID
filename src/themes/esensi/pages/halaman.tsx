import type { HalamanProps } from "@/themes/types";
import { ThemePageHeader, ThemeProse } from "@/themes/ui";

/** Halaman statis (dari `halaman_statis`). */
export function EsensiHalaman({ judul, isi }: HalamanProps) {
  return (
    <article className="space-y-6">
      <ThemePageHeader title={judul} />
      <ThemeProse html={isi} className="space-y-4 text-base leading-relaxed" />
    </article>
  );
}
