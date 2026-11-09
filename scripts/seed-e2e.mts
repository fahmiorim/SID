import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { createConnection, type RowDataPacket } from "mysql2/promise";

/**
 * Siapkan akun fixture E2E yang dipakai `e2e.config.ts`:
 *
 * - `warga-e2e`          → akun warga (punya `resident_id`, PIN sudah aktif)
 * - `warga-e2e-operator` → role operator
 * - `sekdes-e2e`         → role sekretaris desa
 * - `kades-e2e`          → role kepala desa
 *
 * Idempoten: akun yang sudah ada disegarkan (role, status, sandi) tanpa membuat
 * duplikat. Jalankan setelah `npm run db:seed`:
 *
 *   npm run e2e:seed
 */
const PASSWORD = process.env.E2E_WARGA_PASSWORD ?? "TestWarga#12345";
const WARGA_NIK = "3201010101010001";

interface UserRow extends RowDataPacket {
  id: string;
}

interface RoleRow extends RowDataPacket {
  id: number;
  slug: string;
}

interface VillageRow extends RowDataPacket {
  id: number;
}

async function main(): Promise<void> {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL diperlukan untuk menyiapkan akun E2E.");

  const db = await createConnection(dsn);

  try {
    const [villages] = await db.query<VillageRow[]>("SELECT id FROM villages ORDER BY id LIMIT 1");
    const villageId = villages[0]?.id;
    if (!villageId) throw new Error("Desa belum ada. Jalankan `npm run db:seed` lebih dulu.");

    const [roles] = await db.query<RoleRow[]>(
      "SELECT id, slug FROM roles WHERE village_id = ? AND slug IN (?, ?, ?)",
      [villageId, "operator", "sekretaris-desa", "kepala-desa"],
    );
    const roleId = new Map(roles.map((role) => [role.slug, role.id]));
    const operatorRoleId = roleId.get("operator");
    const sekdesRoleId = roleId.get("sekretaris-desa");
    const kadesRoleId = roleId.get("kepala-desa");
    if (!operatorRoleId || !sekdesRoleId || !kadesRoleId) {
      throw new Error("Role operator/sekretaris-desa/kepala-desa tidak ditemukan.");
    }

    // Penduduk untuk akun warga (unik per desa berdasarkan NIK).
    await db.execute(
      `INSERT INTO residents (village_id, national_id, name, gender, address)
       VALUES (?, ?, ?, 'male', ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name)`,
      [villageId, WARGA_NIK, "Warga Uji E2E", "Jl. Uji E2E No. 1"],
    );
    const [residentRows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM residents WHERE village_id = ? AND national_id = ? LIMIT 1",
      [villageId, WARGA_NIK],
    );
    const residentId = residentRows[0]?.id;
    if (typeof residentId !== "number") throw new Error("Penduduk fixture E2E tidak ditemukan.");

    // Domain `localhost` dipetakan ke desa utama agar resolusi host tetap
    // bekerja ketika test membuat desa fixture tambahan (mode multi-desa).
    await db.execute(
      `INSERT INTO village_domains (village_id, domain, is_primary)
       VALUES (?, 'localhost', 0)
       ON DUPLICATE KEY UPDATE village_id = VALUES(village_id)`,
      [villageId],
    );

    const passwordHash = await hashPassword(PASSWORD);

    const akun: Array<{
      username: string;
      name: string;
      roleId: number | null;
      residentId: number | null;
    }> = [
      { username: "warga-e2e", name: "Warga Uji E2E", roleId: null, residentId },
      {
        username: "warga-e2e-operator",
        name: "Operator Uji E2E",
        roleId: operatorRoleId,
        residentId: null,
      },
      {
        username: "sekdes-e2e",
        name: "Sekretaris Desa Uji E2E",
        roleId: sekdesRoleId,
        residentId: null,
      },
      { username: "kades-e2e", name: "Kepala Desa Uji E2E", roleId: kadesRoleId, residentId: null },
    ];

    for (const item of akun) {
      const email = `${item.username}@e2e.invalid`;
      const [existing] = await db.query<UserRow[]>(
        "SELECT id FROM users WHERE username = ? LIMIT 1",
        [item.username],
      );
      const userId = existing[0]?.id ?? randomUUID();

      if (existing[0]) {
        await db.execute(
          `UPDATE users
           SET name = ?, email = ?, email_verified = 1, village_id = ?, role_id = ?,
               resident_id = ?, active = 1, must_change_pin = 0
           WHERE id = ?`,
          [item.name, email, villageId, item.roleId, item.residentId, userId],
        );
      } else {
        await db.execute(
          `INSERT INTO users
             (id, name, email, email_verified, username, display_username, village_id,
              role_id, resident_id, active, must_change_pin)
           VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 1, 0)`,
          [
            userId,
            item.name,
            email,
            item.username,
            item.username,
            villageId,
            item.roleId,
            item.residentId,
          ],
        );
      }

      const [accounts] = await db.query<RowDataPacket[]>(
        "SELECT id FROM accounts WHERE provider_id = 'credential' AND account_id = ? LIMIT 1",
        [userId],
      );
      if (accounts[0]) {
        await db.execute("UPDATE accounts SET password = ? WHERE id = ?", [
          passwordHash,
          accounts[0].id,
        ]);
      } else {
        await db.execute(
          `INSERT INTO accounts (id, account_id, provider_id, user_id, password)
           VALUES (?, ?, 'credential', ?, ?)`,
          [randomUUID(), userId, userId, passwordHash],
        );
      }
    }

    console.log(`Akun E2E siap di desa ${villageId}: ${akun.map((a) => a.username).join(", ")}`);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
