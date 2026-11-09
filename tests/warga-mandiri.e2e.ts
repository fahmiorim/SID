import { test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import {
  buatPendudukUntukRegistrasi,
  buatSuratUjiDenganToken,
  hapusIzinDariAlasan,
  hapusLapakDariNama,
  hapusRegistrasiWargaDariNik,
  hapusSuratDariToken,
} from "./support/database";
import { masukDenganKredensial } from "./support/login";

const KATALOG = "OS-WGA-001/002/006/007/010/011";

/**
 * Katalog: OS-WGA-001, OS-WGA-002, OS-WGA-006, OS-WGA-007, OS-WGA-010,
 * OS-WGA-011 — Login warga, pesan dua arah, lapak milik sendiri, pengajuan
 * izin, verifikasi surat di area warga, dan registrasi mandiri yang disetujui
 * operator.
 */
test(
  `${KATALOG} — warga masuk, kirim pesan, kelola lapak, ajukan izin, verifikasi surat, dan registrasi`,
  { timeout: 240_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const pesan = `Pesan E2E ${cap}: mohon info jam layanan surat.`;
    const namaLapak = `Lapak Warga E2E ${cap}`;
    const alamatAwal = "Dusun Melati RT 01";
    const alamatBaru = "Dusun Melati RT 02";
    const alasanIzin = `Keperluan keluarga E2E ${cap}`;
    const nikRegistrasi = `3201${String(cap).padStart(12, "0").slice(-12)}`;
    const namaRegistrasi = `Calon Warga E2E ${cap}`;
    const tokenSurat = cap.toString(16).padStart(16, "0").repeat(4);
    const nomorSurat = `E2E/WGA/${cap}`;
    const jenisSurat = `Surat Keterangan Uji E2E ${cap}`;

    try {
      await buatPendudukUntukRegistrasi(nikRegistrasi, namaRegistrasi);
      await buatSuratUjiDenganToken({
        token: tokenSurat,
        nomor: nomorSurat,
        jenis: jenisSurat,
        tanggal: "2026-11-09",
      });

      // 1. Login warga memakai captcha aritmetika.
      const warga = credentials.user("warga-e2e");
      await app.clearState();
      await app.open("/masuk");
      await masukDenganKredensial(screen, browser, warga.username, warga.password);
      await expect(browser).toHaveURL("/layanan-mandiri/beranda");
      await expect(screen.getByText("Selamat datang,")).toBeVisible();
      await expect(screen.getByText("Permohonan terbaru")).toBeVisible();

      // 2. Pesan warga → operator tampil di percakapan.
      await app.open("/layanan-mandiri/pesan");
      await expect(screen.getByRole("heading", { name: "Pesan" })).toBeVisible();
      await screen.getByLabel("Tulis pesan").fill(pesan);
      await screen.getByRole("button", { name: "Kirim", exact: true }).tap();
      await expect(screen.getByText("Pesan terkirim ke operator desa.")).toBeVisible({
        timeout: 15_000,
      });
      await app.open("/layanan-mandiri/pesan");
      await expect(screen.getByText(pesan)).toBeVisible();

      // 3. Lapak warga: tambah, ubah alamat, tampil di katalog publik, lalu hapus.
      await app.open("/layanan-mandiri/lapak");
      await expect(screen.getByRole("heading", { name: "Lapak Saya" })).toBeVisible();
      await screen.getByRole("button", { name: "Tambah lapak" }).tap();
      await screen.getByLabel("Nama usaha").fill(namaLapak);
      await screen.getByLabel("Kategori").fill("Jasa");
      await screen.getByLabel("Alamat").fill(alamatAwal);
      // Tombol pembuka form tetap ada (disabled); submit ada di dalam form.
      await screen.getByRole("button", { name: "Tambah lapak" }).last().tap();
      await expect(screen.getByText("Lapak berhasil ditambahkan.")).toBeVisible({
        timeout: 15_000,
      });
      await app.open("/layanan-mandiri/lapak");
      await expect(screen.getByText(new RegExp(namaLapak))).toBeVisible();

      await screen.getByRole("button", { name: `Ubah ${namaLapak}` }).tap();
      await screen.getByLabel("Alamat").last().fill(alamatBaru);
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Lapak berhasil diperbarui.")).toBeVisible({
        timeout: 15_000,
      });
      await app.open("/layanan-mandiri/lapak");
      await expect(screen.getByText(alamatBaru)).toBeVisible();

      await app.open(`/desa/lapak?q=${encodeURIComponent(namaLapak)}`);
      await expect(screen.getByText(new RegExp(namaLapak)).first()).toBeVisible({
        timeout: 15_000,
      });

      // Hapus lapak dikonfirmasi lewat window.confirm native.
      await app.open("/layanan-mandiri/lapak");
      const lepasDialog = await browser.onDialog("accept");
      await screen.getByRole("button", { name: `Hapus ${namaLapak}` }).tap();
      await expect(screen.getByText("Lapak berhasil dihapus.")).toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText(new RegExp(namaLapak))).toHaveCount(0);
      await lepasDialog();

      // 4. Izin: ajukan dan muncul sebagai menunggu persetujuan.
      await app.open("/layanan-mandiri/izin");
      await expect(screen.getByRole("heading", { name: "Izin & Cuti" })).toBeVisible();
      await browser.evaluate(() => {
        const select = document.querySelector<HTMLSelectElement>('select[name="jenis"]');
        if (select) select.value = "sakit";
      });
      await screen.getByLabel("Tanggal mulai").fill("2026-12-01");
      await screen.getByLabel("Tanggal selesai").fill("2026-12-02");
      await screen.getByLabel("Alasan").fill(alasanIzin);
      await screen.getByRole("button", { name: "Kirim pengajuan", exact: true }).tap();
      await expect(
        screen.getByText("Pengajuan izin terkirim dan menunggu persetujuan."),
      ).toBeVisible({ timeout: 15_000 });
      await app.open("/layanan-mandiri/izin");
      await expect(screen.getByText(alasanIzin)).toBeVisible();
      await expect(screen.getByText("Menunggu").first()).toBeVisible();

      // 5. Verifikasi surat area warga: token valid menampilkan surat terbit.
      await app.open("/layanan-mandiri/verifikasi-surat");
      await expect(screen.getByRole("heading", { name: "Verifikasi Surat" })).toBeVisible();
      await screen.getByLabel("Token verifikasi").fill(tokenSurat);
      await screen.getByRole("button", { name: "Verifikasi", exact: true }).tap();
      await expect(screen.getByText("Sudah terbit")).toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText(nomorSurat)).toBeVisible();
      await expect(screen.getByText(new RegExp(jenisSurat)).first()).toBeVisible();

      await app.open(`/layanan-mandiri/verifikasi-surat?token=${"0".repeat(64)}`);
      await expect(screen.getByText(/tidak ditemukan di desa ini/)).toBeVisible();

      // 6. Registrasi mandiri: warga mengajukan, admin menyetujui, PIN tampil.
      await app.clearState();
      await app.open("/desa/registrasi-warga");
      await expect(
        screen.getByRole("heading", { name: "Registrasi Akun Layanan Mandiri" }),
      ).toBeVisible();
      await screen.getByLabel("NIK").fill(nikRegistrasi);
      await screen.getByLabel("Nama lengkap").fill(namaRegistrasi);
      await screen.getByLabel(/Nomor HP/).fill("081234567890");

      const labelCaptcha = await browser.locator('label[for="jawaban"]').textContent();
      const cocok = labelCaptcha?.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
      if (!cocok) throw new Error(`Label captcha registrasi tidak dikenali: ${labelCaptcha}`);
      const jawaban =
        cocok[2] === "+"
          ? Number(cocok[1]) + Number(cocok[3])
          : Number(cocok[1]) - Number(cocok[3]);
      await browser.locator('input[name="jawaban"]').fill(String(jawaban));
      await screen.getByRole("button", { name: "Kirim Permohonan" }).tap();
      await expect(
        screen.getByText(
          "Permohonan akun dikirim. Petugas desa akan memeriksa dan menghubungi Anda.",
        ),
      ).toBeVisible({ timeout: 15_000 });

      await app.clearState();
      await app.open("/masuk");
      const admin = credentials.user("admin");
      await masukDenganKredensial(screen, browser, admin.username, admin.password);
      await expect(browser).toHaveURL("/beranda");

      await app.open("/penduduk/registrasi");
      const barisPermohonan = screen.getByRole("row").filter({ hasText: nikRegistrasi });
      await expect(barisPermohonan).toBeVisible();
      await barisPermohonan
        .getByRole("button", { name: `Setujui permohonan ${namaRegistrasi}` })
        .tap();
      await expect(screen.getByText("Permohonan disetujui dan akun warga dibuat.")).toBeVisible({
        timeout: 15_000,
      });
      const dialogKredensial = screen.getByRole("dialog");
      await expect(dialogKredensial).toBeVisible();
      await expect(dialogKredensial.getByText("PIN sementara")).toBeVisible();
      await dialogKredensial.getByRole("button", { name: "Selesai" }).tap();
      await expect(barisPermohonan.getByText("Disetujui")).toBeVisible();
    } finally {
      await hapusLapakDariNama(namaLapak);
      await hapusIzinDariAlasan(alasanIzin);
      await hapusSuratDariToken(tokenSurat);
      await hapusRegistrasiWargaDariNik(nikRegistrasi);
    }
  },
);
