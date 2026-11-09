import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatPendudukDptUji,
  buatProgramBantuanDariNama,
  hapusPendudukDariNik,
  hapusProgramBantuanDariNama,
} from "./support/database";

function nikUnik(): string {
  return `3201${String(Date.now()).slice(-8)}${String(Math.floor(Math.random() * 10_000)).padStart(4, "0")}`;
}

/**
 * Katalog: OS-POP-012 — Impor peserta bantuan dari CSV.
 *
 * Program baru belum punya peserta; dialog peserta harus tetap menyediakan
 * impor. Setelah impor, baris peserta muncul dan impor ulang dilewati tanpa
 * membuat duplikat.
 */
test(
  "bantuan: impor peserta CSV pada program kosong dan idempoten",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const namaProgram = `Program Impor E2E ${cap}`;
    const namaPeserta = `Peserta Impor E2E ${cap}`;
    const nik = nikUnik();
    const berkas = join("tests", "fixtures", `.tmp-peserta-${cap}.csv`);

    try {
      await buatPendudukDptUji(nik, namaPeserta);
      await buatProgramBantuanDariNama(namaProgram);
      await writeFile(
        berkas,
        ["NIK,No. Kartu,Nama pada Kartu", `${nik},KARTU-E2E-${cap},${namaPeserta}`].join("\n"),
        "utf8",
      );

      await app.open(`/bantuan?q=${encodeURIComponent(namaProgram)}`);
      await screen.getByRole("button", { name: `Aksi untuk program ${namaProgram}` }).tap();
      await screen.getByRole("menuitem", { name: "Peserta" }).tap();

      const dialogPeserta = screen.getByRole("dialog").filter({ hasText: "Peserta —" });
      await expect(dialogPeserta.getByText("Belum ada peserta pada program ini.")).toBeVisible();
      await dialogPeserta.getByRole("button", { name: "Impor", exact: true }).tap();

      const dialogImpor = screen.getByRole("dialog").filter({ hasText: "Impor Peserta" }).last();
      await expect(dialogImpor.getByRole("heading", { name: /Impor Peserta/ })).toBeVisible();
      await browser.locator('input[type="file"]').last().setInputFiles(berkas);
      await dialogImpor.getByRole("button", { name: "Impor", exact: true }).tap();
      await expect(dialogImpor.getByText(/1 peserta ditambahkan/)).toBeVisible({
        timeout: 15_000,
      });
      await dialogImpor.getByRole("button", { name: "Close" }).first().tap();

      const baris = dialogPeserta.getByRole("row").filter({ hasText: namaPeserta });
      await expect(baris).toBeVisible({ timeout: 15_000 });
      await expect(baris.getByText(`KARTU-E2E-${cap}`)).toBeVisible();

      // Impor ulang harus melewati peserta yang sudah terdaftar.
      await dialogPeserta.getByRole("button", { name: "Impor", exact: true }).tap();
      const dialogUlang = screen.getByRole("dialog").filter({ hasText: "Impor Peserta" }).last();
      await browser.locator('input[type="file"]').last().setInputFiles(berkas);
      await dialogUlang.getByRole("button", { name: "Impor", exact: true }).tap();
      await expect(dialogUlang.getByText(/0 peserta ditambahkan; 1 sudah terdaftar/)).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await rm(berkas, { force: true }).catch(() => undefined);
      await hapusProgramBantuanDariNama(namaProgram);
      await hapusPendudukDariNik(nik);
    }
  },
);
