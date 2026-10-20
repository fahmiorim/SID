import { and, eq, sql } from "drizzle-orm";

import { db, pool } from "@/db";
import {
  bloodTypes,
  citizenships,
  educations,
  familyRelations,
  keuanganTemplate,
  letterClassifications,
  letterTypes,
  maritalStatuses,
  modules,
  occupations,
  religions,
  rolePermissions,
  roles,
  users,
  villages,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

import { KEUANGAN_TEMPLATE_SEEDS } from "./data/keuangan";
import { MODULE_SEEDS } from "./data/modules";
import {
  BLOOD_TYPE_SEEDS,
  CITIZENSHIP_SEEDS,
  EDUCATION_SEEDS,
  FAMILY_RELATION_SEEDS,
  MARITAL_STATUS_SEEDS,
  OCCUPATION_SEEDS,
  RELIGION_SEEDS,
} from "./data/references";
import { ROLE_SEEDS, type RoleSeed } from "./data/roles";
import { JENIS_SURAT_SEEDS, KLASIFIKASI_SURAT_SEEDS } from "./data/surat";

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

/**
 * Isi katalog referensi kependudukan.
 *
 * Katalog bersifat statis dan bertumpu pada `id` baku, jadi cukup di-upsert:
 * baris baru disisipkan, baris lama namanya disegarkan dari nilai yang dikirim
 * (`values(name)`). Idempoten.
 */
async function seedReferenceCatalogs(): Promise<void> {
  await db
    .insert(religions)
    .values([...RELIGION_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
  await db
    .insert(educations)
    .values([...EDUCATION_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
  await db
    .insert(occupations)
    .values([...OCCUPATION_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
  await db
    .insert(maritalStatuses)
    .values([...MARITAL_STATUS_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
  await db
    .insert(familyRelations)
    .values([...FAMILY_RELATION_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
  await db
    .insert(bloodTypes)
    .values([...BLOOD_TYPE_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
  await db
    .insert(citizenships)
    .values([...CITIZENSHIP_SEEDS])
    .onDuplicateKeyUpdate({ set: { name: sql`values(name)` } });
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

async function seedSuratCatalog(villageId: number): Promise<void> {
  const classificationIds = new Map<string, number>();

  for (const item of KLASIFIKASI_SURAT_SEEDS) {
    const [existing] = await db
      .select({ id: letterClassifications.id })
      .from(letterClassifications)
      .where(
        and(
          eq(letterClassifications.villageId, villageId),
          eq(letterClassifications.code, item.code),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(letterClassifications)
        .set({ name: item.name })
        .where(eq(letterClassifications.id, existing.id));
      classificationIds.set(item.code, existing.id);
    } else {
      const inserted = unwrap(
        await db
          .insert(letterClassifications)
          .values({ villageId, code: item.code, name: item.name })
          .$returningId(),
      );
      classificationIds.set(item.code, inserted.id);
    }
  }

  for (const item of JENIS_SURAT_SEEDS) {
    const values = {
      villageId,
      classificationId: classificationIds.get(item.classificationCode) ?? null,
      code: item.code,
      name: item.name,
      templateBody: item.templateBody,
      requiresResident: item.requiresResident,
      isActive: item.isActive,
      numberFormat: item.numberFormat,
      validityMonths: item.validityMonths,
      sortOrder: item.sortOrder,
    };

    const [existing] = await db
      .select({ id: letterTypes.id })
      .from(letterTypes)
      .where(and(eq(letterTypes.villageId, villageId), eq(letterTypes.code, item.code)))
      .limit(1);

    if (existing) {
      await db.update(letterTypes).set(values).where(eq(letterTypes.id, existing.id));
    } else {
      await db.insert(letterTypes).values(values);
    }
  }
}

/**
 * Isi katalog pohon rekening APBDes (`keuangan_template`).
 *
 * `parent_uuid` diturunkan dari kode itu sendiri (segmen terakhir dibuang),
 * sehingga seed cukup memuat daftar kode + uraian. Idempoten via upsert
 * `uraian`.
 */
async function seedKeuanganTemplate(): Promise<void> {
  const rows = KEUANGAN_TEMPLATE_SEEDS.map((item) => {
    const parts = item.uuid.split(".");
    return {
      uuid: item.uuid,
      parentUuid: parts.length > 1 ? parts.slice(0, -1).join(".") : null,
      uraian: item.uraian,
    };
  });

  if (rows.length === 0) return;

  await db
    .insert(keuanganTemplate)
    .values(rows)
    .onDuplicateKeyUpdate({
      set: { uraian: sql`values(uraian)`, parentUuid: sql`values(parent_uuid)` },
    });
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
  await seedReferenceCatalogs();
  console.log("• katalog referensi kependudukan disiapkan");

  const villageId = await ensureVillage();
  console.log(`• village id = ${villageId}`);

  const roleIds = new Map<string, number>();
  for (const role of ROLE_SEEDS) {
    roleIds.set(role.slug, await upsertRole(villageId, role));
  }
  console.log(`• ${roleIds.size} role disiapkan`);

  const slugToId = await upsertModules(villageId);
  console.log(`• ${slugToId.size} modul disiapkan`);

  await seedSuratCatalog(villageId);
  await seedKeuanganTemplate();
  console.log("• katalog persuratan disiapkan");
  console.log("• pohon rekening APBDes disiapkan");

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
