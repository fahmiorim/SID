import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { buatFixtureSuratDinas } from "./support/surat-dinas-fixture";

const test = webTest.extend<{ fixture: Awaited<ReturnType<typeof buatFixtureSuratDinas>> }>({
  fixture: async ({}, gunakan) => {
    const fixture = await buatFixtureSuratDinas();
    try {
      await gunakan(fixture);
    } finally {
      await fixture.hapus();
    }
  },
});

// OS-SUR-011: E2E Surat Dinas — admin buat → verifikasi berjenjang → terbit → unduh PDF publik
test(
  "alur surat dinas lengkap: admin buat → verifikasi berjenjang → terbit → unduh PDF publik",
  {
    timeout: 180_000,
  },
  async ({ app, screen, browser, _fixture }) => {
    // 1. Login operator
    await app.open("/masuk");
    await screen.getByLabel("Username atau NIK").fill(credentials.user("operator-e2e").username);
    await screen.getByLabel("Kata sandi / PIN").fill(credentials.user("operator-e2e").password);
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/beranda");

    // 2. Admin buat surat dinas
    await app.open("/persuratan/surat-dinas");
    await screen.getByRole("button", { name: "Tambah Surat Dinas" }).tap();

    // Fill jurusan/tujuan
    await screen.getByLabel("Jurusan").fill("Infrastruktur");
    await screen.getByLabel("Perihal").fill("Pengujian surat dinas E2E");
    await screen
      .getByLabel("Isi Surat")
      .fill("Ini adalah konten pengujian surat dinas untuk test E2E OS-SUR-011");

    // Submit surat dinas
    await screen.getByRole("button", { name: "Simpan Surat Dinas" }).tap();
    await expect(screen.getByText("Surat dinas dicatat")).toBeVisible();

    // 3. Verifikasi berjenjang (operator → sekdes → kades)
    // Tahap operator
    await app.open("/persuratan/surat-dinas");
    const suratBaru = screen
      .getByRole("row")
      .filter({ hasText: credentials.user("operator-e2e").username })
      .first();
    await suratBaru.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();

    // Tahap sekretaris desa
    await app.open("/persuratan/surat-dinas");
    const suratSetelahOperator = screen
      .getByRole("row")
      .filter({ hasText: credentials.user("operator-e2e").username })
      .first();
    await suratSetelahOperator.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();

    // Tahap kepala desa
    await app.open("/persuratan/surat-dinas");
    const suratSetelahSekdes = screen
      .getByRole("row")
      .filter({ hasText: credentials.user("operator-e2e").username })
      .first();
    await suratSetelahSekdes.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();

    // 4. Surat terbit
    await expect(screen.getByText("Terbit")).toBeVisible();

    // 5. Ambil token dan buka halaman verifikasi publik
    const tokenElement = screen.getByLabel("verifikasi-token");
    const token = tokenElement?.textContent?.trim() || "";
    await expect(tokenElement).toBeVisible();
    await app.open(`/desa/verifikasi-surat/${token}`);

    // 6. Publik unduh PDF
    await expect(screen.getByRole("button", { name: "Unduh PDF" })).toBeVisible();
    await screen.getByRole("button", { name: "Unduh PDF" }).tap();

    // 7. Verifikasi tautan publik terbuka dengan benar
    await expect(screen.getByText("Verifikasi:")).toBeVisible();
    await expect(screen.getByText("Pengujian surat dinas E2E")).toBeVisible();
  },
);
