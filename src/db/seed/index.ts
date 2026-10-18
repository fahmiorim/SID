import { and, eq } from "drizzle-orm";

import { db, pool } from "@/db";
import { modules, rolePermissions, roles, users, villages } from "@/db/schema";
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

async function ensureVillage(): Promise<number> {
  const [existing] = await db.select({ id: villages.id }).from(villages).limit(1);
  if (existing) return existing.id;

  const inserted = unwrap(
    await db
      .insert(villages)
      .values({
        name: "Desa Contoh",
        code: "3201012001",
        postalCode: "16710",
        district: "Kecamatan Contoh",
        districtCode: "3201012",
        regency: "Kabupaten Contoh",
        province: "Provinsi Contoh",
        officeAddress: "Jl. Contoh No. 1",
        email: "desa@contoh.id",
      })
      .$returningId(),
  );

  return inserted.id;
}

async function upsertRole(villageId: number, seed: RoleSeed): Promise<number> {
  const [existing] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.villageId, villageId), eq(roles.slug, seed.slug)))
    .limit(1);

  if (existing) {
    await db
      .update(roles)
      .set({ name: seed.name, isSystem: seed.isSystem })
      .where(eq(roles.id, existing.id));
    return existing.id;
  }

  const inserted = unwrap(
    await db
      .insert(roles)
      .values({ villageId, name: seed.name, slug: seed.slug, isSystem: seed.isSystem })
      .$returningId(),
  );

  return inserted.id;
}

async function upsertModules(villageId: number): Promise<Map<string, number>> {
  const slugToId = new Map<string, number>();

  // Induk dulu, baru anak, agar id induk sudah tersedia.
  const ordered = [...MODULE_SEEDS].sort(
    (a, b) => Number(Boolean(a.parentSlug)) - Number(Boolean(b.parentSlug)),
  );

  for (const modul of ordered) {
    const parentId = modul.parentSlug ? (slugToId.get(modul.parentSlug) ?? 0) : 0;

    const values = {
      villageId,
      name: modul.name,
      slug: modul.slug,
      url: modul.url,
      icon: modul.icon,
      sortOrder: modul.sortOrder,
      isGroup: modul.isGroup,
      isHidden: modul.isHidden ?? false,
      isActive: modul.isActive ?? true,
      parentId,
    };

    const [existing] = await db
      .select({ id: modules.id })
      .from(modules)
      .where(and(eq(modules.villageId, villageId), eq(modules.slug, modul.slug)))
      .limit(1);

    if (existing) {
      await db.update(modules).set(values).where(eq(modules.id, existing.id));
      slugToId.set(modul.slug, existing.id);
    } else {
      const inserted = unwrap(await db.insert(modules).values(values).$returningId());
      slugToId.set(modul.slug, inserted.id);
    }
  }

  return slugToId;
}

/**
 * Ganti seluruh matriks akses sebuah role agar sinkron dengan seeder.
 *
 * Baris hanya dibuat untuk modul yang diberi akses (tidak ada baris "tanpa
 * akses"), sehingga menghapus baris lama lalu menulis ulang membuat hasilnya
 * idempoten sekaligus membersihkan grant yang sudah dihapus dari seed.
 */
async function replaceGrants(
  roleId: number,
  grants: RoleSeed["grants"],
  slugToId: Map<string, number>,
): Promise<void> {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

  for (const [slug, access] of Object.entries(grants)) {
    const moduleId = slugToId.get(slug);
    if (moduleId === undefined) continue;

    await db.insert(rolePermissions).values({ roleId, moduleId, access });
  }
}

async function ensureAdminUser(villageId: number, roleId: number): Promise<string> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, ADMIN_USERNAME))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ roleId, villageId, active: true, emailVerified: true })
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
      roleId,
      villageId,
      active: true,
      emailVerified: true,
    })
    .where(eq(users.id, user.id));

  return user.id;
}

async function main(): Promise<void> {
  const villageId = await ensureVillage();
  console.log(`• village id = ${villageId}`);

  const roleIds = new Map<string, number>();
  for (const role of ROLE_SEEDS) {
    roleIds.set(role.slug, await upsertRole(villageId, role));
  }
  console.log(`• ${roleIds.size} role disiapkan`);

  const slugToId = await upsertModules(villageId);
  console.log(`• ${slugToId.size} modul disiapkan`);

  for (const role of ROLE_SEEDS) {
    const roleId = roleIds.get(role.slug);
    if (roleId !== undefined) {
      await replaceGrants(roleId, role.grants, slugToId);
    }
  }
  console.log("• matriks akses disiapkan");

  const adminRoleId = roleIds.get("administrator");
  if (adminRoleId === undefined) throw new Error("Role administrator tidak ditemukan.");

  await ensureAdminUser(villageId, adminRoleId);
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
