import type { MetadataRoute } from "next";

import { PUBLIC_NAV } from "@/app/(public)/_components/public-header";
import { getRequestOrigin } from "@/lib/request-origin";

/**
 * Sitemap situs publik.
 *
 * URL dibangun dari host permintaan sehingga tiap domain desa menghasilkan
 * sitemap sendiri (satu basis kode, banyak domain).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getRequestOrigin();

  const halamanStatis: MetadataRoute.Sitemap = PUBLIC_NAV.filter((item) => item.href !== "/").map(
    (item) => ({
      url: `${base}${item.href}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...halamanStatis,
    { url: `${base}/desa/bantuan`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/desa/dokumen`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/layanan-mandiri`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
