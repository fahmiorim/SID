import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKeuanganTahun, hapusSisaLebihDariKeterangan } from "./support/database";

const TAHUN_SILPA = 2087;
const TAHUN_BERIKUTNYA = 2088;
const TAHUN_PINDAH = 2089;

/**
 * Katalog: OS-FIN-005 — sisa lebih antartahun dan kesinambungan APBDes.
 *
 * Surplus tahun 2087 dihitung dari laporan resmi, lalu dicatat sebagai SiLPA
 * tahun 2088. Angka itu harus masuk ke rekening pembiayaan 6.1.1 APBDes 2088
 * dan laporan realisasi resmi, bukan hanya tersimpan di tabel SiLPA.
 */
test(
  "OS-FIN-005 — SiLPA tahun lalu masuk ke APBDes dan laporan tahun berikutnya",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen }) => {
    const keterangan = `SiLPA antartahun ${Date.now()}`;

    try {
      // Surplus 2087: pendapatan 10 jt, belanja 7 jt.
      await app.open(`/keuangan/anggaran?tahun=${TAHUN_SILPA}`);
      await expect(screen.getByRole("heading", { name: "APBDes" })).toBeVisible();

      const pendapatan = screen.getByRole("row").filter({ hasText: "HASIL USAHA" });
      await pendapatan.getByRole("textbox").first().fill("10000000");
      await pendapatan.getByRole("textbox").last().fill("10000000");

      const belanja = screen
        .getByRole("row")
        .filter({ hasText: "PENGHASILAN TETAP DAN TUNJANGAN" });
      await belanja.getByRole("textbox").first().fill("7000000");
      await belanja.getByRole("textbox").last().fill("7000000");

      await expect(screen.getByText("2 baris berubah")).toBeVisible();
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anggaran & realisasi disimpan.")).toBeVisible();

      await app.open(`/keuangan/laporan/realisasi?tahun=${TAHUN_SILPA}`);
      const silpaTahunLalu = screen
        .getByRole("row")
        .filter({ hasText: "SILPA/SiLPA TAHUN BERJALAN" });
      await expect(silpaTahunLalu).toContainText("Rp 3.000.000");

      // Catat SiLPA 2088; ini harus menjadi penerimaan pembiayaan APBDes 2088.
      await app.open("/keuangan/sisa-lebih");
      await expect(screen.getByRole("heading", { name: "Sisa Lebih Pembiayaan" })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah Data" }).tap();
      await screen.getByLabel("Tahun Anggaran").fill(String(TAHUN_BERIKUTNYA));
      await screen.getByLabel("Jumlah").fill("3000000");
      await screen.getByLabel("Tanggal").fill(`${TAHUN_BERIKUTNYA}-01-10`);
      await screen.getByLabel("Keterangan").fill(keterangan);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil ditambahkan.")).toBeVisible();

      await app.open(`/keuangan/anggaran?tahun=${TAHUN_BERIKUTNYA}`);
      const barisSilpa = screen
        .getByRole("row")
        .filter({ hasText: "SILPA TAHUN ANGGARAN SEBELUMNYA" });
      await expect(barisSilpa.getByRole("textbox").first()).toHaveValue(/3000000/);

      await app.open(`/keuangan/laporan/realisasi?tahun=${TAHUN_BERIKUTNYA}`);
      await expect(
        screen.getByRole("row").filter({ hasText: "SILPA TAHUN ANGGARAN SEBELUMNYA" }),
      ).toContainText("Rp 3.000.000");
      await expect(screen.getByRole("row").filter({ hasText: "PEMBIAYAAN NETTO" })).toContainText(
        "Rp 3.000.000",
      );

      // Ubah jumlah SiLPA; APBDes tahun yang sama ikut berubah.
      await app.open("/keuangan/sisa-lebih");
      const baris = screen.getByRole("row").filter({ hasText: keterangan });
      await baris.getByRole("button", { name: "Ubah" }).tap();
      await screen.getByLabel("Jumlah").fill("4000000");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil diperbarui.")).toBeVisible();

      await app.open(`/keuangan/anggaran?tahun=${TAHUN_BERIKUTNYA}`);
      await expect(
        screen
          .getByRole("row")
          .filter({ hasText: "SILPA TAHUN ANGGARAN SEBELUMNYA" })
          .getByRole("textbox")
          .first(),
      ).toHaveValue(/4000000/);

      // Pindahkan tahun; APBDes tahun lama dibersihkan dan tahun baru menerima nilai.
      await app.open("/keuangan/sisa-lebih");
      await screen
        .getByRole("row")
        .filter({ hasText: keterangan })
        .getByRole("button", { name: "Ubah" })
        .tap();
      await screen.getByLabel("Tahun Anggaran").fill(String(TAHUN_PINDAH));
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil diperbarui.")).toBeVisible();

      await app.open(`/keuangan/anggaran?tahun=${TAHUN_BERIKUTNYA}`);
      await expect(
        screen
          .getByRole("row")
          .filter({ hasText: "SILPA TAHUN ANGGARAN SEBELUMNYA" })
          .getByRole("textbox")
          .first(),
      ).toHaveValue(/^0(\.00)?$/);
      await app.open(`/keuangan/anggaran?tahun=${TAHUN_PINDAH}`);
      await expect(
        screen
          .getByRole("row")
          .filter({ hasText: "SILPA TAHUN ANGGARAN SEBELUMNYA" })
          .getByRole("textbox")
          .first(),
      ).toHaveValue(/4000000/);

      // Hapus catatan; penerimaan pembiayaan kembali nol.
      await app.open("/keuangan/sisa-lebih");
      await screen
        .getByRole("row")
        .filter({ hasText: keterangan })
        .getByRole("button", { name: "Ubah" })
        .tap();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Data SiLPA berhasil dihapus.")).toBeVisible();

      await app.open(`/keuangan/anggaran?tahun=${TAHUN_PINDAH}`);
      await expect(
        screen
          .getByRole("row")
          .filter({ hasText: "SILPA TAHUN ANGGARAN SEBELUMNYA" })
          .getByRole("textbox")
          .first(),
      ).toHaveValue(/^0(\.00)?$/);
    } finally {
      await hapusSisaLebihDariKeterangan(keterangan);
      await hapusKeuanganTahun(TAHUN_SILPA);
      await hapusKeuanganTahun(TAHUN_BERIKUTNYA);
      await hapusKeuanganTahun(TAHUN_PINDAH);
    }
  },
);
