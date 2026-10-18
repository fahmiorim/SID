import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";

const SECRET = "a".repeat(32);

describe("parseEnv", () => {
  it("menerima konfigurasi minimal dan mengisi nilai bawaan", () => {
    const env = parseEnv({
      DATABASE_URL: "mysql://root:@127.0.0.1:3306/desa_dev",
      BETTER_AUTH_SECRET: SECRET,
    });

    expect(env.NODE_ENV).toBe("development");
    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
  });

  it("menolak DATABASE_URL yang kosong", () => {
    expect(() => parseEnv({ DATABASE_URL: "", BETTER_AUTH_SECRET: SECRET })).toThrow(
      /Konfigurasi environment tidak valid/,
    );
  });

  it("menolak BETTER_AUTH_SECRET yang terlalu pendek", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://x", BETTER_AUTH_SECRET: "pendek" })).toThrow(
      /Konfigurasi environment tidak valid/,
    );
  });

  it("menerima pengaturan seeder opsional", () => {
    const env = parseEnv({
      DATABASE_URL: "mysql://x",
      BETTER_AUTH_SECRET: SECRET,
      SEED_ADMIN_USERNAME: "admin",
      SEED_ADMIN_PASSWORD: "Admin#12345",
    });

    expect(env.SEED_ADMIN_USERNAME).toBe("admin");
    expect(env.SEED_ADMIN_PASSWORD).toBe("Admin#12345");
  });

  it("menolak email seeder yang tidak valid", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "mysql://x",
        BETTER_AUTH_SECRET: SECRET,
        SEED_ADMIN_EMAIL: "bukan-email",
      }),
    ).toThrow(/Konfigurasi environment tidak valid/);
  });
});
