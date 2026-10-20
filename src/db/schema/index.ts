/**
 * Titik kumpul definisi skema Drizzle.
 *
 * Skema dipecah per-domain di folder ini. Setiap file mengekspor tabelnya, dan
 * file ini menggabungkannya agar dapat dipakai oleh Drizzle (`db`) maupun
 * better-auth (adapter Drizzle membutuhkan referensi ke tabel `users`,
 * `sessions`, dst.).
 */

export * from "./auth";
export * from "./bantuan";
export * from "./family";
export * from "./incoming-letters";
export * from "./keuangan";
export * from "./letter-classifications";
export * from "./letter-types";
export * from "./letters";
export * from "./outgoing-letters";
export * from "./rbac";
export * from "./reference";
export * from "./region";
export * from "./resident";
export * from "./rumah-tangga";
export * from "./village";
