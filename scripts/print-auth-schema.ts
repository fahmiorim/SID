/**
 * Utilitas pengembangan: cetak definisi tabel yang diharapkan better-auth
 * berdasarkan konfigurasi **nyata** di `src/lib/auth.ts`.
 *
 * Berguna saat menambah plugin atau field baru: jalankan skrip ini untuk
 * melihat bentuk tabel yang diharapkan, lalu selaraskan `src/db/schema/auth.ts`.
 * Skema sengaja diturunkan dari konfigurasi asli (bukan disalin ulang) supaya
 * tidak ada dua sumber kebenaran yang bisa saling menyimpang.
 *
 * Jalankan: npm run auth:schema
 */
import { getSchema } from "better-auth/db";

import { auth } from "@/lib/auth";

const schema = getSchema(auth.options);

const summary: Record<
  string,
  Array<{ field: string; type: string; required: boolean; unique?: boolean }>
> = {};

for (const [table, definition] of Object.entries(schema)) {
  summary[table] = Object.entries(definition.fields).map(([field, attribute]) => ({
    field,
    type: String(attribute.type),
    required: Boolean(attribute.required),
    ...(attribute.unique ? { unique: true } : {}),
  }));
}

console.log(JSON.stringify(summary, null, 2));
