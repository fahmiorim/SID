/**
 * Stub `server-only` untuk pengujian.
 *
 * Package `server-only` melempar error bila di-import di luar RSC,
 * tetapi modul ber-`server-only` (repository) perlu di-import test
 * integrasi. Alias di `vitest.config.mts` mengarahkan import ini ke
 * stub kosong sehingga test dapat memuat `@/db` dan repository.
 */
export {};
