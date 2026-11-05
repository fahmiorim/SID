import { test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

/**
 * Setup: masuk sebagai admin desa.
 *
 * Semua test admin yang butuh sesi wajib mendeklarasikan `session: "admin"`.
 * Kredensial bawaan seed: username `admin`, password `Admin#12345`
 * (lihat `src/db/seed/data/users.ts` — DEFAULT_ADMIN_PASSWORD).
 */
test.setup(
  "authenticate as admin",
  { sessions: ["admin"] },
  async ({ app, screen, session, browser }) => {
    const admin = credentials.user("admin");
    await app.open("/masuk");
    await screen.getByLabel("Username atau NIK").fill(admin.username);
    await screen.getByLabel("Kata sandi / PIN").fill(admin.password);

    // Formulir masuk memakai captcha aritmetika (OS-WGA-001); hitung jawabannya
    // dari label yang tampil, bukan dari nilai tetap.
    const labelCaptcha = await browser.locator('label[for="jawaban"]').innerText();
    const cocok = labelCaptcha.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
    if (!cocok) throw new Error(`Label captcha tidak dikenali: ${labelCaptcha}`);
    const kiri = Number(cocok[1]);
    const kanan = Number(cocok[3]);
    const jawaban = cocok[2] === "+" ? kiri + kanan : kiri - kanan;
    await browser.locator('input[name="jawaban"]').fill(String(jawaban));

    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/beranda");
    await session.save("admin");
  },
);
