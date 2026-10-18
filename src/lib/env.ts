import { z } from "zod";

/**
 * Skema variabel lingkungan (environment variables).
 *
 * Semua akses `process.env` di aplikasi WAJIB melewati modul ini supaya:
 * - nilai yang salah/absen ketahuan lebih awal (fail fast);
 * - tipe yang dipakai di kode sudah terjamin (`env.DATABASE_URL` bertipe string);
 * - tidak ada `process.env.X!` yang bertebaran.
 *
 * Catatan: modul ini TIDAK memakai `server-only` agar dapat dipakai juga oleh
 * skrip Node (drizzle-kit, seeder). Jangan pernah mengimpornya dari komponen
 * client — variabel non-`NEXT_PUBLIC_*` hanya untuk server.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** URL publik aplikasi (untuk tautan absolut, callback OAuth, dsb.). */
  APP_URL: z.url().default("http://localhost:3000"),

  /** DSN MySQL/MariaDB: mysql://user:pass@host:port/database */
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi."),

  /** Secret better-auth, minimal 32 karakter. */
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET minimal 32 karakter."),

  /** Base URL better-auth (biasanya sama dengan APP_URL). */
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),

  // --- Seeder (opsional; hanya dibaca oleh `npm run db:seed`) ---------------
  // Divalidasi di sini agar nilai yang salah ketahuan sebelum menyentuh data.
  SEED_ADMIN_USERNAME: z.string().min(3).optional(),
  SEED_ADMIN_EMAIL: z.email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  SEED_ADMIN_NAME: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Validasi objek environment dan kembalikan nilai bertipe. */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Konfigurasi environment tidak valid:\n${z.prettifyError(result.error)}\n\n` +
        `Pastikan file .env sudah dibuat (lihat .env.example).`,
    );
  }

  return result.data;
}

export const env = parseEnv();
