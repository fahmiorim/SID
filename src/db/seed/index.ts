import { and, eq } from "drizzle-orm";

import { db, pool } from "@/db";
import { config, grupAkses, settingModul, userGrup, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

import { MODULE_SEEDS } from "./data/modules";
import { ROLE_SEEDS, type RoleSeed } from "./data/roles";

/**
 * Seeder fondasi: identitas desa, role, katalog modul, matriks akses, dan satu
 * pengguna administrator. Idempoten — aman dijalankan berulang kali.
 *
 * Jalankan: npm run db:seed
 */

const DEFAULT_ADMIN_PASSWORD = "Admin#12345";

const ADMIN_USERNAME = env.SEED_ADMIN_USERNAME ?? "admin";
const ADMIN_EMAIL = env.SEED_ADMIN_EMAIL ?? "admin@desa.local";
const ADMIN_PASSWORD = env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
const ADMIN_NAME = env.SEED_ADMIN_NAME ?? "Administrator Desa";

/** Ambil elemen pertama array atau gagalkan (menghindari `undefined`). */
function unwrap<T>(values: T[]): T {
  const value = values[0];
  if (value === undefined) throw new Error("Operasi database tidak mengembalikan hasil.");
  return value;
}

async function ensureConfig(): Promise<number> {
  const [existing] = await db.select({ id: config.id }).from(config).limit(1);
  if (existing) return existing.id;

  const inserted = unwrap(
    await db
      .insert(config)
      .values({
        namaDesa: "Desa Contoh",
        kodeDesa: "3201012001",
        kodePos: "16710",
        namaKecamatan: "Kecamatan Contoh",
        kodeKecamatan: "3201012",
        namaKabupaten: "Kabupaten Contoh",
        namaPropinsi: "Provinsi Contoh",
        alamatKantor: "Jl. Contoh No. 1",
        emailDesa: "desa@contoh.id",
      })
      .$returningId(),
  );

  return inserted.id;
}

async function upsertRole(configId: number, seed: RoleSeed): Promise<number> {
  const [existing] = await db
    .select({ id: userGrup.id })
    .from(userGrup)
    .where(and(eq(userGrup.configId, configId), eq(userGrup.slug, seed.slug)))
    .limit(1);

  if (existing) {
    await db
      .update(userGrup)
      .set({ nama: seed.nama, jenis: seed.jenis })
      .where(eq(userGrup.id, existing.id));
    return existing.id;
  }

  const inserted = unwrap(
    await db
      .insert(userGrup)
      .values({ configId, nama: seed.nama, slug: seed.slug, jenis: seed.jenis })
      .$returningId(),
  );

  return inserted.id;
}

async function upsertModules(configId: number): Promise<Map<string, number>> {
  const slugToId = new Map<string, number>();

  // Induk dulu, baru anak, agar id induk sudah tersedia.
  const ordered = [...MODULE_SEEDS].sort(
    (a, b) => Number(Boolean(a.parentSlug)) - Number(Boolean(b.parentSlug)),
  );

  for (const modul of ordered) {
    const parentId = modul.parentSlug ? (slugToId.get(modul.parentSlug) ?? 0) : 0;

    const values = {
      configId,
      modul: modul.modul,
      slug: modul.slug,
      url: modul.url,
      ikon: modul.ikon,
      urut: modul.urut,
      level: modul.level,
      hidden: modul.hidden ?? false,
      aktif: modul.aktif ?? true,
      parent: parentId,
    };

    const [existing] = await db
      .select({ id: settingModul.id })
      .from(settingModul)
      .where(and(eq(settingModul.configId, configId), eq(settingModul.slug, modul.slug)))
      .limit(1);

    if (existing) {
      await db.update(settingModul).set(values).where(eq(settingModul.id, existing.id));
      slugToId.set(modul.slug, existing.id);
    } else {
      const inserted = unwrap(await db.insert(settingModul).values(values).$returningId());
      slugToId.set(modul.slug, inserted.id);
    }
  }

  return slugToId;
}

async function upsertGrants(
  configId: number,
  roleId: number,
  grants: Record<string, number>,
  slugToId: Map<string, number>,
): Promise<void> {
  for (const [slug, akses] of Object.entries(grants)) {
    const idModul = slugToId.get(slug);
    if (idModul === undefined) continue;

    const [existing] = await db
      .select({ id: grupAkses.id })
      .from(grupAkses)
      .where(and(eq(grupAkses.idGrup, roleId), eq(grupAkses.idModul, idModul)))
      .limit(1);

    if (existing) {
      await db.update(grupAkses).set({ akses }).where(eq(grupAkses.id, existing.id));
    } else {
      await db.insert(grupAkses).values({ configId, idGrup: roleId, idModul, akses });
    }
  }
}

async function ensureAdminUser(configId: number, grupId: number): Promise<string> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, ADMIN_USERNAME))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ grupId, configId, active: true, emailVerified: true })
      .where(eq(users.id, existing.id));
    return existing.id;
  }

  const { user } = await auth.api.signUpEmail({
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME },
  });

  await db
    .update(users)
    .set({
      username: ADMIN_USERNAME,
      displayUsername: ADMIN_USERNAME,
      grupId,
      configId,
      active: true,
      emailVerified: true,
    })
    .where(eq(users.id, user.id));

  return user.id;
}

async function main(): Promise<void> {
  const configId = await ensureConfig();
  console.log(`• config id = ${configId}`);

  const roleIds = new Map<string, number>();
  for (const role of ROLE_SEEDS) {
    roleIds.set(role.slug, await upsertRole(configId, role));
  }
  console.log(`• ${roleIds.size} role disiapkan`);

  const slugToId = await upsertModules(configId);
  console.log(`• ${slugToId.size} modul disiapkan`);

  for (const role of ROLE_SEEDS) {
    const roleId = roleIds.get(role.slug);
    if (roleId !== undefined) {
      await upsertGrants(configId, roleId, role.grants, slugToId);
    }
  }
  console.log("• matriks akses disiapkan");

  const adminRoleId = roleIds.get("administrator");
  if (adminRoleId === undefined) throw new Error("Role administrator tidak ditemukan.");

  await ensureAdminUser(configId, adminRoleId);
  console.log("• pengguna administrator disiapkan");

  console.log("\nSelesai. Kredensial administrator:");
  console.log(`   username : ${ADMIN_USERNAME}`);
  console.log(
    ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD
      ? `   password : ${DEFAULT_ADMIN_PASSWORD}  (BAWAAN — segera ganti, atau set SEED_ADMIN_PASSWORD)`
      : "   password : (dari SEED_ADMIN_PASSWORD)",
  );
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exitCode = 1;
  });
