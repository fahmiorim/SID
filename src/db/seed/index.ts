import { pool } from "@/db";

import { seedFoundation } from "./foundation";

/**
 * Entrypoint seeder fondasi (`npm run db:seed`).
 *
 * Logika seeding berada di `foundation.ts` agar dapat dipakai ulang oleh
 * seeder konten desa tertentu tanpa menjalankan proses CLI.
 */
seedFoundation()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exitCode = 1;
  });
