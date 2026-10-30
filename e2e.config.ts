import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin#12345";
const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const appCommand = process.env.APP_URL
  ? undefined
  : {
      executable: "npm",
      args: ["run", "dev", "--", "--hostname", "localhost", "--port", "3000"],
      log: ".e2e/logs/app.log",
    };

export default {
  tests: "tests/**/*.e2e.ts",
  credentials: {
    admin: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
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
