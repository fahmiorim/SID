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
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/beranda");
    await session.save("admin");
  },
);
