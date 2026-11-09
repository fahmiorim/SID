import { test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

/**
 * Setup sesi E2E.
 *
 * Akun fixture dibuat oleh `npm run e2e:seed` (lihat `scripts/seed-e2e.mts`):
 * `warga-e2e`, `warga-e2e-operator`, `sekdes-e2e`, dan `kades-e2e`.
 * Kredensial bawaan seed: username `admin`, password `Admin#12345`
 * (lihat `src/db/seed/index.ts` — DEFAULT_ADMIN_PASSWORD).
 */
async function masuk(
  app: { open(path: string): Promise<void>; clearState(): Promise<void> },
  screen: {
    getByLabel(label: string): { fill(value: string): Promise<void> };
    getByRole(role: "button", options: { name: string }): { tap(): Promise<void> };
  },
  browser: {
    locator(selector: string): {
      textContent(): Promise<string | null>;
      fill(value: string): Promise<void>;
    };
  },
  username: string,
  password: string,
) {
  await app.clearState();
  await app.open("/masuk");
  await screen.getByLabel("Username atau NIK").fill(username);
  await screen.getByLabel("Kata sandi / PIN").fill(password);

  // Formulir masuk memakai captcha aritmetika (OS-WGA-001); hitung jawabannya
  // dari label yang tampil, bukan dari nilai tetap.
  const labelCaptcha = await browser.locator('label[for="jawaban"]').textContent();
  const cocok = labelCaptcha?.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
  if (!cocok) throw new Error(`Label captcha tidak dikenali: ${labelCaptcha}`);
  const kiri = Number(cocok[1]);
  const kanan = Number(cocok[3]);
  const jawaban = cocok[2] === "+" ? kiri + kanan : kiri - kanan;
  await browser.locator('input[name="jawaban"]').fill(String(jawaban));

  await screen.getByRole("button", { name: "Masuk" }).tap();
}

test.setup(
  "authenticate as admin",
  { sessions: ["admin"] },
  async ({ app, screen, session, browser }) => {
    const admin = credentials.user("admin");
    await masuk(app, screen, browser, admin.username, admin.password);
    await expect(browser).toHaveURL("/beranda");
    await session.save("admin");
  },
);

test.setup(
  "authenticate as warga",
  { sessions: ["warga-e2e"] },
  async ({ app, screen, session, browser }) => {
    const warga = credentials.user("warga-e2e");
    await masuk(app, screen, browser, warga.username, warga.password);
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");
    await session.save("warga-e2e");
  },
);

for (const akun of ["warga-e2e-operator", "sekdes-e2e", "kades-e2e"] as const) {
  test.setup(
    `authenticate as ${akun}`,
    { sessions: [akun] },
    async ({ app, screen, session, browser }) => {
      const user = credentials.user(akun);
      await masuk(app, screen, browser, user.username, user.password);
      await expect(browser).toHaveURL("/beranda");
      await session.save(akun);
    },
  );
}
