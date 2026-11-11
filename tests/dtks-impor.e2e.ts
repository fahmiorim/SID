import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatRtmDenganKepalaUji, hapusRtmUji } from "./support/database";

const KATALOG = "OS-POP-006";

/** Chrome di Windows kadang masih memegang handle berkas unggahan saat cleanup. */
async function hapusBerkasSementara(berkas: string): Promise<void> {
  for (let percobaan = 0; percobaan < 20; percobaan++) {
    try {
      await rm(berkas, { force: true });
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EBUSY") throw error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  await rm(berkas, { force: true }).catch(() => undefined);
}

/**
 * Katalog: OS-POP-006 — Impor DTKS dari CSV.
 *
 * Impor tidak membuat RTM baru: berkas menautkan nomor RTM yang sudah ada ke
 * formulir DTKS dan menyalin seluruh penduduk RTM sebagai anggota. Berkas uji
 * dibuat dari RTM fixture agar nomornya unik, lalu alurnya diperiksa sampai
 * daftar, dialog kelola, perubahan status, dan impor ulang yang idempoten.
 */
test(
  `${KATALOG} — impor CSV menautkan RTM, menampilkan anggota, dan idempoten`,
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nomorRtm = `E2E-DTKS-${cap}`;
    const namaKepala = `Kepala RTM E2E ${cap}`;
    const namaResponden = `Responden E2E ${cap}`;
    const namaPetugas = `Petugas E2E ${cap}`;
    const berkas = join("tests", "fixtures", `.tmp-dtks-${cap}.csv`);
    let rtmId: number | null = null;

    try {
      rtmId = await buatRtmDenganKepalaUji({ nomor: nomorRtm, namaKepala });
      await writeFile(
        berkas,
        [
          "No. RTM,Nama Responden,Nama Petugas,Tanggal Pencacahan",
          `${nomorRtm},${namaResponden},${namaPetugas},2026-11-10`,
        ].join("\n"),
        "utf8",
      );

      // 1. Impor berkas lewat dialog.
      await app.open("/penduduk/dtks");
      await expect(screen.getByRole("heading", { name: "DTKS", exact: true })).toBeVisible();
      await screen.getByRole("button", { name: "Impor", exact: true }).tap();
      const dialogImpor = screen.getByRole("dialog");
      await expect(dialogImpor.getByRole("heading", { name: "Impor DTKS" })).toBeVisible();
      await browser.locator('input[type="file"]').setInputFiles(berkas);
      await dialogImpor.getByRole("button", { name: "Impor", exact: true }).tap();
      await expect(dialogImpor.getByText(/1 formulir dibuat; 0 dilewati/)).toBeVisible({
        timeout: 15_000,
      });

      // 2. RTM hasil impor muncul dengan kepala dari RTM dan status Draf.
      await app.open(`/penduduk/dtks?search=${encodeURIComponent(nomorRtm)}`);
      const baris = () => screen.getByRole("row").filter({ hasText: nomorRtm });
      await expect(baris()).toBeVisible({ timeout: 15_000 });
      await expect(baris().getByText(namaKepala)).toBeVisible();
      await expect(baris().getByText("Draf")).toBeVisible();

      // 3. Dialog Kelola memuat metadata impor dan anggota RTM.
      await baris().getByRole("button", { name: "Kelola" }).tap();
      const dialog = screen.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Kelola DTKS" })).toBeVisible();
      await expect(dialog.getByText(namaKepala)).toBeVisible();
      await expect(dialog.getByText("Anggota (1)")).toBeVisible();

      const nilai = await browser.evaluate(() => ({
        responden: document.querySelector<HTMLInputElement>('input[name="namaResponden"]')?.value,
        petugas: document.querySelector<HTMLInputElement>('input[name="namaPetugasPencacahan"]')
          ?.value,
        tanggal: document.querySelector<HTMLInputElement>('input[name="tanggalPencacahan"]')?.value,
      }));
      expect(nilai.responden).toBe(namaResponden);
      expect(nilai.petugas).toBe(namaPetugas);
      expect(nilai.tanggal).toBe("2026-11-10");

      // 4. Verifikasi formulir lewat kontrol status (Radix Select).
      const terisi = await browser.evaluate(() => {
        const select = document.querySelector<HTMLSelectElement>(
          '[role="dialog"] select[name="status"]',
        );
        if (!select) return false;
        select.value = "terverifikasi";
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return select.value;
      });
      expect(terisi).toBe("terverifikasi");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });
      await expect(baris().getByText("Terverifikasi")).toBeVisible({ timeout: 15_000 });

      // 5. Laporan rekap dan ekspor CSV membaca status yang baru disimpan.
      await app.open("/penduduk/dtks/laporan");
      await expect(screen.getByRole("heading", { name: "Laporan DTKS" })).toBeVisible();
      await expect(screen.getByText("Formulir DTKS")).toBeVisible();
      const barisStatus = screen.getByRole("row").filter({ hasText: "Terverifikasi" });
      await expect(barisStatus).toBeVisible();
      await expect(barisStatus.getByRole("cell").nth(1)).not.toHaveText("0");

      const laporan = await browser.evaluate(async () => {
        const res = await fetch("/penduduk/dtks/laporan/ekspor");
        return {
          status: res.status,
          type: res.headers.get("content-type") ?? "",
          body: await res.text(),
        };
      });
      expect(laporan.status).toBe(200);
      expect(laporan.type).toContain("text/csv");
      expect(laporan.body).toContain("Rekapitulasi DTKS");
      expect(laporan.body).toContain("Terverifikasi");

      const daftar = await browser.evaluate(async (nomor) => {
        const res = await fetch(`/penduduk/dtks/ekspor?search=${encodeURIComponent(nomor)}`);
        return { status: res.status, body: await res.text() };
      }, nomorRtm);
      expect(daftar.status).toBe(200);
      expect(daftar.body).toContain(nomorRtm);

      // 6. Impor ulang tidak membuat duplikat dan melewati RTM yang sudah ada.
      await app.open("/penduduk/dtks");
      await screen.getByRole("button", { name: "Impor", exact: true }).tap();
      const dialogUlang = screen.getByRole("dialog");
      await browser.locator('input[type="file"]').setInputFiles(berkas);
      await dialogUlang.getByRole("button", { name: "Impor", exact: true }).tap();
      await expect(dialogUlang.getByText(/0 formulir dibuat; 1 dilewati/)).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await hapusBerkasSementara(berkas);
      if (rtmId !== null) await hapusRtmUji(rtmId);
    }
  },
);
