import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Cache Components dinonaktifkan dengan sengaja.
   *
   * Aplikasi ini adalah sistem administrasi yang menuntut autentikasi: hampir
   * semua rute membaca sesi per-pengguna dan data desa yang dinamis, sehingga
   * model "use cache" nyaris tidak memberi manfaat namun menambah kerumitan
   * (setiap halaman dinamis wajib dibungkus Suspense). Kita memakai model
   * dinamis klasik dan dapat mengaktifkan Cache Components kembali, per rute,
   * untuk permukaan publik yang benar-benar layak di-cache.
   */
  cacheComponents: false,

  /**
   * Kunci root Turbopack ke folder proyek. Tanpa ini, Next menelusuri ke atas
   * dan menemukan lockfile lain di luar repo (mis. D:\laragon\www).
   */
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  /**
   * Permohonan surat mengunggah beberapa berkas syarat sekaligus lewat Server
   * Action. Batas bawaan 1 MB terlalu kecil untuk PDF 20 MB + beberapa gambar,
   * jadi beri ruang untuk total maksimum satu formulir (termasuk overhead
   * multipart).
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "35mb",
    },
  },
};

export default nextConfig;
