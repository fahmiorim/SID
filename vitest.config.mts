import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Konfigurasi Vitest.
 *
 * Hanya menguji **logika murni** (domain & utilitas) yang tidak menyentuh
 * database maupun `next/headers`, sehingga berjalan cepat tanpa setup khusus.
 *
 * `test.env` mengisi variabel yang wajib ada karena `src/lib/env.ts` memvalidasi
 * environment saat modulnya di-import (fail fast). Nilainya fiktif — tidak ada
 * koneksi database yang dibuka dalam pengujian unit.
 *
 * Berkas ini memakai ekstensi `.mts` karena `package.json` tidak bertipe module.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "mysql://root:@127.0.0.1:3306/desa_test",
      BETTER_AUTH_SECRET: "rahasia-uji-coba-minimal-32-karakter",
    },
  },
});
