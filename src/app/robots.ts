import type { MetadataRoute } from "next";

import { getRequestOrigin } from "@/lib/request-origin";

/** Area admin dan layanan mandiri tidak perlu diindeks mesin pencari. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getRequestOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/beranda",
        "/masuk",
        "/pengaturan",
        "/penduduk",
        "/keluarga",
        "/persuratan",
        "/keuangan",
        "/bantuan",
        "/inventaris",
        "/bumindes",
        "/kelompok",
        "/permohonan-surat",
        "/api/",
      ],
    },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
