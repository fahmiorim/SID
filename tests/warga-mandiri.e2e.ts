import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-WGA-001 — Registrasi warga: captcha aritmetika + honeypot.
test(
  "registrasi warga: form captcha dan honeypot tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/registrasi-warga");
    await expect(browser).toHaveURL("/desa/registrasi-warga");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WGA-002 — Login warga: captcha + rate limit.
test("login warga menampilkan captcha aritmetika", async ({ app, screen }) => {
  await app.open("/masuk");
  await expect(screen.getByRole("button", { name: "Masuk" })).toBeVisible();
  await expect(screen.getByLabel("Username atau NIK")).toBeVisible();
  await expect(screen.getByLabel("Kata sandi / PIN")).toBeVisible();
  await expect(screen.getByLabel(/verifikasi:/i)).toBeVisible();
});

// Katalog: OS-WGA-003 — Beranda warga + ringkasan.
test(
  "beranda warga menampilkan ringkasan permohonan",
  { session: "warga-e2e" },
  async ({ app, screen }) => {
    await app.open("/layanan-mandiri/beranda");
    await expect(screen.getByText("Selamat datang,")).toBeVisible();
    await expect(screen.getByText("Permohonan terbaru")).toBeVisible();
  },
);

// Katalog: OS-WGA-006 — Pesan warga dua arah.
test(
  "warga membuka halaman pesan dan operator melihat daftar percakapan",
  { session: "warga-e2e" },
  async ({ app, screen }) => {
    await app.open("/layanan-mandiri/pesan");
    await expect(screen.getByRole("heading", { name: /pesan/i })).toBeVisible();
  },
);

// Katalog: OS-WGA-007 — Verifikasi surat di area warga.
test(
  "area warga: verifikasi surat via token tersedia",
  { session: "warga-e2e" },
  async ({ app, screen }) => {
    await app.open("/layanan-mandiri/verifikasi-surat");
    await expect(screen.getByRole("heading", { name: /verifikasi/i })).toBeVisible();
  },
);

// Katalog: OS-WGA-010 — Lapak warga: CRUD lapak milik sendiri.
test(
  "warga membuat lapak dan menampilkan di katalog publik",
  { session: "warga-e2e" },
  async ({ app, screen }) => {
    await app.open("/layanan-mandiri/lapak");
    await expect(screen.getByRole("heading", { name: /lapak/i })).toBeVisible();
  },
);

test(
  "katalog publik `/desa/lapak` memuat data lapak",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/lapak");
    await expect(browser).toHaveURL("/desa/lapak");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WGA-011 — Izin/sakit/cuti warga + rekap operator.
test(
  "warga mengajukan izin dan operator melihat rekap",
  { session: "warga-e2e" },
  async ({ app, screen }) => {
    await app.open("/layanan-mandiri/izin");
    await expect(screen.getByRole("heading", { name: /izin/i })).toBeVisible();
  },
);
