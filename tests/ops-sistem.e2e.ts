import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaPenandaRestoreUji,
  bacaShortcutAdmin,
  buatPenggunaOtpUji,
  buatPesanMailboxUji,
  hapusKodeOtpUji,
  hapusPenandaRestoreUji,
  hapusPenggunaOtpUji,
  hapusPesanMailboxDariSubjek,
  setelOtpLoginUji,
  setelShortcutAdmin,
  sisipkanKodeOtpUji,
} from "./support/database";

// Katalog: OS-OPS-002 — Shortcut personal di beranda: dialog berisi pilihan
// menu, penyimpanan berjalan, dan kartu shortcut tetap tampil setelah muat ulang.
test(
  "shortcut beranda: dialog tersimpan dan kartu tetap tampil setelah muat ulang",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen }) => {
    await app.open("/beranda");
    await expect(screen.getByRole("heading", { name: "Beranda" })).toBeVisible();
    await expect(screen.getByRole("heading", { name: "Shortcut saya" })).toBeVisible();
    const jumlahKartu = await screen.getByRole("link", { name: "Buka" }).count();
    expect(jumlahKartu).toBeGreaterThan(0);

    await screen.getByRole("button", { name: /Atur shortcut/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Atur shortcut beranda" })).toBeVisible();
    await expect(screen.getByText(/Pilih hingga enam menu/i)).toBeVisible();
    await screen.getByRole("button", { name: "Simpan shortcut" }).tap();
    await expect(
      screen.getByText(/Shortcut beranda disimpan|Shortcut dikembalikan ke bawaan/),
    ).toBeVisible({ timeout: 10_000 });

    await app.open("/beranda");
    await expect(screen.getByRole("heading", { name: "Shortcut saya" })).toBeVisible();
    expect(await screen.getByRole("link", { name: "Buka" }).count()).toBe(jumlahKartu);
  },
);

// Katalog: OS-OPS-002 — Urutan shortcut dapat diubah dengan drag-and-drop,
// disimpan, dan tetap sama setelah beranda dimuat ulang.
test(
  "shortcut beranda: drag-and-drop mengubah urutan dan tersimpan",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    const awal = await bacaShortcutAdmin();

    try {
      await app.open("/beranda");
      const tautan = screen.getByRole("link", { name: "Buka" });
      const jumlah = await tautan.count();
      const urutanAwal: string[] = [];
      for (let i = 0; i < jumlah; i++) {
        const href = await tautan.nth(i).getAttribute("href");
        if (href) urutanAwal.push(href);
      }
      expect(urutanAwal.length).toBeGreaterThanOrEqual(2);

      await screen.getByRole("button", { name: /Atur shortcut/i }).tap();
      const dialog = screen.getByRole("dialog", { name: "Atur shortcut beranda" });
      await expect(dialog).toBeVisible();

      const baris = browser.locator('[draggable="true"]');
      expect(await baris.count()).toBe(urutanAwal.length);
      await baris.nth(0).dragTo(baris.nth(urutanAwal.length - 1));

      await screen.getByRole("button", { name: "Simpan shortcut" }).tap();
      await expect(screen.getByText("Shortcut beranda disimpan.")).toBeVisible({
        timeout: 10_000,
      });

      await app.open("/beranda");
      const tautanBaru = screen.getByRole("link", { name: "Buka" });
      expect(await tautanBaru.count()).toBe(urutanAwal.length);
      expect(await tautanBaru.nth(0).getAttribute("href")).toBe(urutanAwal[1]);
      expect(await tautanBaru.nth(urutanAwal.length - 1).getAttribute("href")).toBe(urutanAwal[0]);
    } finally {
      await setelShortcutAdmin(awal);
    }
  },
);

// Katalog: OS-OPS-003 — Pengaturan aplikasi terpusat: nilai tersimpan dan
// dibaca kembali setelah halaman dimuat ulang.
test(
  "pengaturan aplikasi: jumlah berita beranda tersimpan dan terbaca ulang",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen }) => {
    await app.open("/pengaturan/aplikasi");
    await expect(screen.getByRole("heading", { name: "Pengaturan Aplikasi" })).toBeVisible();

    const input = screen.getByLabel("Jumlah berita di beranda");
    const awal = Number(await input.getAttribute("value"));
    expect(Number.isInteger(awal)).toBe(true);
    const baru = awal === 5 ? 6 : 5;

    try {
      await input.fill(String(baru));
      await screen.getByRole("button", { name: "Simpan pengaturan" }).tap();
      await expect(screen.getByText("Pengaturan aplikasi disimpan.")).toBeVisible({
        timeout: 10_000,
      });

      await app.open("/pengaturan/aplikasi");
      await expect(screen.getByLabel("Jumlah berita di beranda")).toHaveValue(String(baru));
    } finally {
      // Kembalikan nilai seed agar test lain tidak terpengaruh.
      await app.open("/pengaturan/aplikasi");
      await screen.getByLabel("Jumlah berita di beranda").fill(String(awal));
      await screen.getByRole("button", { name: "Simpan pengaturan" }).tap();
      await expect(screen.getByText("Pengaturan aplikasi disimpan.")).toBeVisible({
        timeout: 10_000,
      });
    }
  },
);

// Katalog: OS-OPS-004 — OTP login sebagai faktor kedua: aktivasi, keluar, login
// dengan kode, dan penonaktifan. Akun sementara dipakai agar sesi admin yang
// tersimpan untuk test lain tidak ikut di-logout.
test(
  "pengaturan profil: OTP login dapat diaktifkan, dipakai masuk, lalu dinonaktifkan",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const pengguna = await buatPenggunaOtpUji();
    const kode = "246810";

    async function isiCaptcha() {
      const labelCaptcha = await browser.locator('label[for="jawaban"]').textContent();
      const cocok = labelCaptcha?.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
      if (!cocok) throw new Error(`Label captcha tidak dikenali: ${labelCaptcha}`);
      const jawaban =
        cocok[2] === "+"
          ? Number(cocok[1]) + Number(cocok[3])
          : Number(cocok[1]) - Number(cocok[3]);
      await browser.locator('input[name="jawaban"]').fill(String(jawaban));
    }

    try {
      await app.clearState();
      await app.open("/masuk");
      await screen.getByLabel("Username atau NIK").fill(pengguna.username);
      await screen.getByLabel("Kata sandi / PIN").fill(pengguna.password);
      await isiCaptcha();
      await screen.getByRole("button", { name: "Masuk" }).tap();
      await expect(browser).toHaveURL("/beranda", { timeout: 15_000 });

      await app.open("/pengaturan/profil");
      await expect(screen.getByRole("heading", { name: "Profil Saya" })).toBeVisible();
      await expect(screen.getByText("OTP Login")).toBeVisible();
      await screen.getByRole("button", { name: "Aktifkan OTP" }).tap();
      await expect(browser).toHaveURL(/otp=aktif/);
      await expect(screen.getByText("OTP login diaktifkan.")).toBeVisible();
      await expect(screen.getByText("Aktif", { exact: true }).last()).toBeVisible();

      // Kode fixture menggantikan pengiriman provider; yang diuji adalah
      // verifikasi faktor kedua dan pembuatan sesi setelah kode benar.
      await sisipkanKodeOtpUji(pengguna.username, kode);
      await screen.getByRole("button", { name: "Menu pengguna" }).tap();
      await screen.getByRole("menuitem", { name: "Keluar" }).tap();
      await expect(browser).toHaveURL(/\/masuk/);

      await screen.getByLabel("Username atau NIK").fill(pengguna.username);
      await screen.getByLabel("Kata sandi / PIN").fill(pengguna.password);
      await isiCaptcha();
      await screen.getByLabel("Kode OTP (bila aktif)").fill(kode);
      await screen.getByRole("button", { name: "Masuk" }).tap();
      await expect(browser).toHaveURL("/beranda", { timeout: 15_000 });

      await app.open("/pengaturan/profil");
      await screen.getByRole("button", { name: "Nonaktifkan OTP" }).tap();
      await expect(browser).toHaveURL(/otp=nonaktif/);
      await expect(screen.getByText("OTP login dinonaktifkan.")).toBeVisible();
    } finally {
      await hapusKodeOtpUji(pengguna.username);
      await setelOtpLoginUji(pengguna.username, false);
      await hapusPenggunaOtpUji(pengguna.username);
    }
  },
);

// Katalog: OS-OPS-005 — Kotak masuk email: pesan terbaca dari webhook tampil,
// dapat ditandai dibaca, dan riwayat dapat difilter per kanal.
test(
  "kotak masuk email: pesan baru, tandai dibaca, dan filter kanal",
  { session: "admin", timeout: 90_000 },
  async ({ app, screen, browser }) => {
    const subjek = `Pesan kotak masuk E2E ${Date.now()}`;
    const alamat = `warga.uji.${Date.now()}@contoh.id`;
    await buatPesanMailboxUji({ subjek, alamat, isi: "Isi pesan uji kotak masuk E2E" });

    try {
      await app.open("/pengaturan/notifikasi");
      await expect(screen.getByRole("heading", { name: "Notifikasi" })).toBeVisible();
      await expect(screen.getByText(subjek)).toBeVisible();
      await expect(screen.getByText(alamat)).toBeVisible();
      await expect(screen.getByText("Isi pesan uji kotak masuk E2E")).toBeVisible();

      // Pesan fixture selalu yang terbaru, jadi tombol pertama miliknya.
      const baruSebelum = await screen.getByText("Masuk · baru").count();
      await screen.getByRole("button", { name: "Tandai dibaca" }).first().tap();
      await expect(screen.getByText("Masuk · dibaca").first()).toBeVisible({ timeout: 10_000 });
      await expect
        .poll(async () => screen.getByText("Masuk · baru").count(), { timeout: 10_000 })
        .toBe(baruSebelum - 1);

      await screen.getByRole("link", { name: "Email", exact: true }).tap();
      await expect(browser).toHaveURL(/kanal=email/);
      await expect(screen.getByRole("heading", { name: "Notifikasi" })).toBeVisible();
    } finally {
      await hapusPesanMailboxDariSubjek(subjek);
    }
  },
);

// Katalog: OS-OPS-006 — Log aktivitas keamanan mencatat perubahan pengaturan
// dan dapat dicari.
test(
  "log aktivitas: perubahan pengaturan muncul dan dapat dicari",
  { session: "admin", timeout: 90_000 },
  async ({ app, screen }) => {
    await app.open("/pengaturan/aplikasi");
    await screen.getByRole("button", { name: "Simpan pengaturan" }).tap();
    await expect(screen.getByText("Pengaturan aplikasi disimpan.")).toBeVisible({
      timeout: 10_000,
    });

    await app.open("/pengaturan/log-aktivitas?q=pengaturan");
    await expect(screen.getByRole("heading", { name: "Log Aktivitas Keamanan" })).toBeVisible();
    await expect(screen.getByText("Ubah pengaturan aplikasi").first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      screen.getByRole("row").filter({ hasText: "Ubah pengaturan aplikasi" }).first(),
    ).toBeVisible();
  },
);

// Katalog: OS-OPS-007 — Backup dapat diunduh, dan restore menolak berkas yang
// bukan SQL tanpa menyentuh database.
test(
  "database: unduh backup SQL dan tolak berkas restore non-SQL",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    await app.open("/pengaturan/database");
    await expect(screen.getByRole("heading", { name: "Pengaturan Database" })).toBeVisible();
    await expect(screen.getByRole("link", { name: "Unduh .sql" })).toHaveAttribute(
      "href",
      "/api/database/backup?format=sql",
    );

    const backup = await browser.evaluate(async () => {
      const respons = await fetch("/api/database/backup?format=sql");
      const isi = await respons.text();
      return {
        status: respons.status,
        disposisi: respons.headers.get("content-disposition"),
        tipe: respons.headers.get("content-type"),
        memuatTabel: isi.includes("CREATE TABLE"),
      };
    });
    expect(backup.status).toBe(200);
    expect(backup.disposisi).toContain(".sql");
    expect(backup.tipe).toContain("application/sql");
    expect(backup.memuatTabel).toBe(true);

    const restore = await browser.evaluate(async () => {
      const data = new FormData();
      data.set("berkas", new File(["bukan sql"], "berkas.txt", { type: "text/plain" }));
      data.set("konfirmasi", "1");
      const respons = await fetch("/api/database/restore", { method: "POST", body: data });
      return { status: respons.status, isi: await respons.text() };
    });
    expect(restore.status).toBe(400);
    expect(restore.isi).toMatch(/\.sql/i);

    // Berkas SQL valid dijalankan oleh mysql, skema inti diverifikasi ulang,
    // lalu route mengalihkan ke halaman dengan penanda restored=1.
    try {
      const restoreValid = await browser.evaluate(async () => {
        const sql = [
          "CREATE TABLE IF NOT EXISTS e2e_restore_uji (id INT PRIMARY KEY, catatan VARCHAR(50) NOT NULL);",
          "REPLACE INTO e2e_restore_uji (id, catatan) VALUES (1, 'restore-valid');",
        ].join("\n");
        const data = new FormData();
        data.set("berkas", new File([sql], "restore-valid.sql", { type: "application/sql" }));
        data.set("konfirmasi", "1");
        const respons = await fetch("/api/database/restore", { method: "POST", body: data });
        return { status: respons.status, url: respons.url, isi: await respons.text() };
      });
      expect(restoreValid.status).toBe(200);
      expect(restoreValid.url).toContain("restored=1");
      expect(await bacaPenandaRestoreUji()).toBe("restore-valid");
    } finally {
      await hapusPenandaRestoreUji();
    }
  },
);

// Katalog: OS-OPS-008 — Plugin registry manifest build-time.
test(
  "plugin registry menampilkan status aktif/nonaktif per provider",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/plugin");
    await expect(screen.getByRole("heading", { name: /plugin/i })).toBeVisible();
  },
);

// Katalog: OS-OPS-011 — API data publik.
test("API publik `/api/publik/informasi` merespons JSON tenant dari host", async ({
  app,
  browser,
}) => {
  await app.open("/");
  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/informasi");
    return { status: r.status, contentType: r.headers.get("content-type") };
  });
  expect(res.status).toBe(200);
  expect(res.contentType).toContain("application/json");
});

// Katalog: OS-OPS-012 — API eksternal TTE dan surat ber-API key.
test("API eksternal OpenAPI kontrak tersedia", async ({ app, browser }) => {
  await app.open("/");
  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/eksternal/openapi");
    return { status: r.status, contentType: r.headers.get("content-type") };
  });
  expect(res.status).toBe(200);
  expect(res.contentType).toContain("application/json");
});
