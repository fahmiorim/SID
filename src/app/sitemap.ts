import type { MetadataRoute } from "next";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { PUBLIC_NAV } from "@/features/publik/domain/menu";
import {
  listAlbumGaleri,
  listSlugBerita,
  listSlugHalaman,
} from "@/features/publik/infrastructure/content-repository";
import { getRequestOrigin } from "@/lib/request-origin";

/**
 * Sitemap situs publik.
 *
 * URL dibangun dari host permintaan sehingga tiap domain desa menghasilkan
 * sitemap sendiri (satu basis kode, banyak domain). Konten dinamis (berita,
 * album, halaman statis) ikut dimasukkan agar seluruh halaman publik terindeks.
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

  const dasar: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...halamanStatis,
    { url: `${base}/desa/bantuan`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/desa/dokumen`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/desa/kelompok`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/desa/inventaris`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/desa/status-des`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/desa/surat`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/desa/analisis-survei`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/desa/idm-sdgs`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/layanan-mandiri`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Konten dinamis bersifat opsional: kegagalan (mis. desa belum dipetakan)
  // tidak boleh membuat seluruh sitemap gagal.
  try {
    const desa = await getIdentitasFromRequest();
    const [slugBerita, album, slugHalaman] = await Promise.all([
      listSlugBerita(desa.id),
      listAlbumGaleri(desa.id),
      listSlugHalaman(desa.id),
    ]);

    return [
      ...dasar,
      ...slugBerita.map((slug) => ({
        url: `${base}/desa/berita/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...album.map((item) => ({
        url: `${base}/desa/galeri/${item.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...slugHalaman.map((slug) => ({
        url: `${base}/desa/halaman/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return dasar;
  }
}
