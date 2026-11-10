import { test as webTest } from "@e2e-dev/web";
import { expect } from "e2e";
import { createPool } from "mysql2/promise";

import { masukDenganKredensial } from "./support/login";

const test = webTest;

/**
 * OS-WEB-020 — Agenda kegiatan desa.
 *
 * Membuktikan pemisahan sumber data: hanya agenda dengan `tayang = true` yang
 * tampil di `/desa/agenda` dan beranda, sedangkan draf tetap terlihat pengelola.
 * Agenda surat (`bumindes_agenda`) tidak lagi dipakai halaman publik.
 */
async function denganDb<T>(
  fn: (jalankan: (sql: string, params?: unknown[]) => Promise<void>) => Promise<T>,
) {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk E2E agenda.");

  const pool = createPool(dsn);
  try {
    return await fn(async (sql, params) => {
      await pool.execute(sql, params);
    });
  } finally {
    await pool.end();
  }
}

test(
  "OS-WEB-020 — agenda kegiatan: admin menambah agenda dan publik hanya melihat yang tayang",
  { tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    const run = Date.now();
    const judulTayang = `Musyawarah Uji ${run}`;
    const judulDraf = `Rapat Internal ${run}`;
    const judulBaru = `Kerja Bakti Uji ${run}`;

    await denganDb(async (jalankan) => {
      await jalankan(
        `INSERT INTO agenda_kegiatan (village_id, judul, mulai, selesai, lokasi, deskripsi, tayang)
         SELECT village_id, ?, '2099-12-31', '2100-01-02', 'Balai Desa Uji', 'Agenda tayang untuk E2E', 1
           FROM users WHERE username = 'admin' LIMIT 1`,
        [judulTayang],
      );
      await jalankan(
        `INSERT INTO agenda_kegiatan (village_id, judul, mulai, lokasi, tayang)
         SELECT village_id, ?, '2099-12-30', 'Ruang Rapat', 0
           FROM users WHERE username = 'admin' LIMIT 1`,
        [judulDraf],
      );
    });

    try {
      // --- Publik: hanya agenda tayang yang terlihat ---
      await app.open("/desa/agenda");
      await expect(screen.getByRole("heading", { name: "Agenda Kegiatan" })).toBeVisible({
        timeout: 10_000,
      });
      await expect(screen.getByText(judulTayang)).toBeVisible();
      await expect(screen.getByText("31 Desember 2099 – 2 Januari 2100")).toBeVisible();
      await expect(screen.getByText("Balai Desa Uji")).toBeVisible();
      await expect(screen.getByText(judulDraf)).toHaveCount(0);

      // API publik memakai agenda kegiatan, bukan agenda surat. Bagian beranda
      // bergantung opsi tema desa, jadi sumber datanya dibuktikan di sini.
      const agendaApi = await browser.evaluate(async () => {
        const res = await fetch("/api/publik/surat?limit=100");
        const body = (await res.json()) as { data?: { agenda?: { judul: string }[] } };
        return body.data?.agenda?.map((item) => item.judul) ?? [];
      });
      expect(agendaApi).toContain(judulTayang);
      expect(agendaApi).not.toContain(judulDraf);

      // --- Admin menambah agenda yang langsung ditayangkan ---
      await app.clearState();
      await app.open("/masuk");
      await masukDenganKredensial(screen, browser, "admin", "Admin#12345");
      await expect(browser).toHaveURL("/beranda");

      await app.open("/konten/agenda");
      await expect(screen.getByRole("heading", { name: "Agenda Kegiatan" })).toBeVisible({
        timeout: 10_000,
      });
      await expect(screen.getByText(judulDraf)).toBeVisible();

      await screen.getByRole("button", { name: "Tambah agenda" }).tap();
      await screen.getByLabel("Judul kegiatan").fill(judulBaru);
      await screen.getByLabel("Tanggal mulai").fill("2099-11-20");
      await screen.getByLabel("Lokasi").fill("Lapangan Desa");
      await screen.getByLabel("Tayangkan di situs publik").tap();
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();

      const barisBaru = screen.getByRole("row").filter({ hasText: judulBaru });
      await expect(barisBaru).toBeVisible({ timeout: 10_000 });
      await expect(barisBaru.getByText("Tayang", { exact: true })).toBeVisible();

      // --- Publik melihat agenda baru ---
      await app.clearState();
      await app.open("/desa/agenda");
      await expect(screen.getByText(judulBaru)).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByText("20 November 2099")).toBeVisible();
    } finally {
      await denganDb(async (jalankan) => {
        await jalankan("DELETE FROM agenda_kegiatan WHERE judul IN (?, ?, ?)", [
          judulTayang,
          judulDraf,
          judulBaru,
        ]);
      });
    }
  },
);
