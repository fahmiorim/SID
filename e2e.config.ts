import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";

// Muat `.env` agar fixture (DATABASE_URL) dan APP_URL tersedia saat
// `npx e2e run` dijalankan langsung, sama seperti `npm run dev`. Di CI seluruh
// variabel sudah disediakan environment, jadi berkas ini opsional.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // Tidak ada `.env`; biarkan e2e memakai environment yang ada.
  }
}

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin#12345";
const E2E_WARGA_PASSWORD = process.env.E2E_WARGA_PASSWORD ?? "TestWarga#12345";
const appUrl = process.env.APP_URL ?? "http://localhost:3000/masuk";
const appCommand = process.env.APP_URL
  ? undefined
  : {
      executable: "npm",
      args: ["run", "dev", "--", "--hostname", "localhost", "--port", "3000"],
      log: ".e2e/logs/app.log",
    };

export default {
  tests: "tests/**/*.e2e.ts",
  // 16 worker default membuat 56 berkas UI berebut satu dev server dan database,
  // sehingga Server Action kadang melewati deadline assertion. Enam worker tetap
  // paralel tetapi cukup stabil untuk suite penuh.
  workers: 6,
  // Login warga memakai scrypt (better-auth) di server. Saat seluruh suite
  // berjalan paralel, satu proses masuk dapat melewati 5 detik bawaan e2e
  // sehingga assertion URL gagal padahal kredensial valid. Beri ruang lebih
  // longgar khusus untuk deadline `expect`.
  assertionTimeout: 15_000,
  credentials: {
    admin: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    "warga-e2e": { username: "warga-e2e", password: E2E_WARGA_PASSWORD },
    "warga-e2e-operator": { username: "warga-e2e-operator", password: E2E_WARGA_PASSWORD },
    "sekdes-e2e": { username: "sekdes-e2e", password: E2E_WARGA_PASSWORD },
    "kades-e2e": { username: "kades-e2e", password: E2E_WARGA_PASSWORD },
  },
  targets: [
    {
      name: "web",
      engine: web(),
      app: {
        url: appUrl,
        ...(appCommand ? { command: appCommand } : {}),
      },
    },
  ],
} satisfies E2EConfig;
