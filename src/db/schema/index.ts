/**
 * Titik kumpul definisi skema Drizzle.
 *
 * Skema dipecah per-domain di folder ini. Setiap file mengekspor tabelnya, dan
 * file ini menggabungkannya agar dapat dipakai oleh Drizzle (`db`) maupun
 * better-auth (adapter Drizzle membutuhkan referensi ke tabel `users`,
 * `sessions`, dst.).
 */

export * from "./auth";
export * from "./rbac";
export * from "./tenant";
export * from "./wilayah";
