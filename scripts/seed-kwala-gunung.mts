#!/usr/bin/env node

import "dotenv/config";

import { pool } from "@/db";

import { seedKwalaGunung } from "../src/db/seed/kwala-gunung";

async function main() {
  console.log("Seed Kwala Gunung dimulai…");
  const villageId = await seedKwalaGunung();
  console.log(`Village id: ${villageId}`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
