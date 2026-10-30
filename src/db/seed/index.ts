import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";

import { db, pool } from "@/db";
import {
  accounts,
  berita,
  beritaKategori,
  bloodTypes,
  citizenships,
  dokumenPublik,
  educations,
  familyRelations,
  jabatanPerangkat,
  keuanganTemplate,
  letterClassifications,
  letterRequirements,
  letterTypes,
  maritalStatuses,
  menuPublik,
  modules,
  occupations,
  perangkatDesa,
  profilDesa,
  religions,
  rolePermissions,
  roles,
  theme,
  users,
  villages,
} from "@/db/schema";
import { env } from "@/lib/env";
import { DEFAULT_THEME_MANIFEST } from "@/themes/manifests";

import { KEUANGAN_TEMPLATE_SEEDS } from "./data/keuangan";
import {
  BERITA_CONTOH,
  DOKUMEN_SEEDS,
  JABATAN_SEEDS,
  KATEGORI_BERITA_SEEDS,
  MENU_SEEDS,
  PROFIL_SEED,
} from "./data/konten";
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
import { JENIS_SURAT_SEEDS, KLASIFIKASI_SURAT_SEEDS, SYARAT_SURAT_SEEDS } from "./data/surat";

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
  roleSlug: string,
  roleId: number,
  grants: RoleSeed["grants"],
  slugToId: Map<string, number>,
): Promise<void> {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

  for (const [slug, access] of Object.entries(grants)) {
    const moduleId = slugToId.get(slug);
    if (moduleId === undefined) {
      throw new Error(
        `Grant role "${roleSlug}" merujuk modul yang tidak ada: "${slug}". ` +
          "Tambahkan modulnya di modules.ts atau hapus grant-nya.",
      );
    }

    await db.insert(rolePermissions).values({ roleId, moduleId, access });
  }
}

/**
 * Siapkan master syarat surat dan kembalikan peta nama → id.
 *
 * Idempoten: baris yang sudah ada disegarkan, sisanya baru disisipkan.
 */
async function seedSyaratSurat(villageId: number): Promise<Map<string, number>> {
  const ids = new Map<string, number>();

  for (const item of SYARAT_SURAT_SEEDS) {
    const [existing] = await db
      .select({ id: letterRequirements.id })
      .from(letterRequirements)
      .where(
        and(eq(letterRequirements.villageId, villageId), eq(letterRequirements.name, item.name)),
      )
      .limit(1);

    if (existing) {
      await db
        .update(letterRequirements)
        .set({ description: item.description, sortOrder: item.sortOrder, isActive: true })
        .where(eq(letterRequirements.id, existing.id));
      ids.set(item.name, existing.id);
      continue;
    }

    const inserted = unwrap(
      await db
        .insert(letterRequirements)
        .values({
          villageId,
          name: item.name,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: true,
        })
        .$returningId(),
    );

    ids.set(item.name, inserted.id);
  }

  return ids;
}

async function seedSuratCatalog(villageId: number): Promise<void> {
  const classificationIds = new Map<string, number>();
  const syaratIds = await seedSyaratSurat(villageId);

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
      formIsian: item.formIsian ? JSON.stringify(item.formIsian) : null,
      syaratSurat: JSON.stringify(
        (item.syaratNames ?? [])
          .map((name) => syaratIds.get(name))
          .filter((id): id is number => id !== undefined),
      ),
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

  // Dibuat langsung (tanpa `auth.api`) agar skrip seed tidak menarik modul
  // `server-only` lewat konfigurasi better-auth. Hash memakai helper resmi
  // better-auth sehingga login PIN/sandi tetap cocok.
  const userId = randomUUID();
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      username: ADMIN_USERNAME,
      displayUsername: ADMIN_USERNAME,
      roleId,
      villageId,
      active: true,
    });

    await tx.insert(accounts).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    });
  });

  return userId;
}

/**
 * Seed konten situs publik (Fase 1C.5).
 *
 * Idempoten: setiap bagian dicek keberadaannya lebih dulu sehingga menjalankan
 * `db:seed` ulang tidak menggandakan baris sekaligus tidak menimpa konten yang
 * sudah disunting operator (hanya menyisipkan contoh saat tabel masih kosong).
 */
async function seedKonten(villageId: number): Promise<void> {
  // Profil desa — satu baris per desa.
  const [profilAda] = await db
    .select({ id: profilDesa.id })
    .from(profilDesa)
    .where(eq(profilDesa.villageId, villageId))
    .limit(1);
  if (!profilAda) {
    await db.insert(profilDesa).values({ villageId, ...PROFIL_SEED });
  }

  // Jabatan perangkat.
  const jabatanIds = new Map<string, number>();
  for (const item of JABATAN_SEEDS) {
    const [ada] = await db
      .select({ id: jabatanPerangkat.id })
      .from(jabatanPerangkat)
      .where(and(eq(jabatanPerangkat.villageId, villageId), eq(jabatanPerangkat.slug, item.slug)))
      .limit(1);
    if (ada) {
      jabatanIds.set(item.slug, ada.id);
    } else {
      const inserted = unwrap(
        await db
          .insert(jabatanPerangkat)
          .values({ villageId, nama: item.nama, slug: item.slug, urut: item.urut })
          .$returningId(),
      );
      jabatanIds.set(item.slug, inserted.id);
    }
  }

  // Perangkat contoh: hanya kepala desa, agar operator mengisi sisanya.
  const [kepalaAda] = await db
    .select({ id: perangkatDesa.id })
    .from(perangkatDesa)
    .where(eq(perangkatDesa.villageId, villageId))
    .limit(1);
  if (!kepalaAda) {
    const [village] = await db
      .select({ name: villages.name, headName: villages.headName })
      .from(villages)
      .where(eq(villages.id, villageId))
      .limit(1);
    await db.insert(perangkatDesa).values({
      villageId,
      jabatanId: jabatanIds.get("kepala-desa") ?? null,
      nama: village?.headName?.trim() || "Kepala Desa",
      penandaTangan: true,
      status: "aktif",
      urut: 1,
    });
  }

  // Kategori berita.
  const kategoriIds = new Map<string, number>();
  for (const item of KATEGORI_BERITA_SEEDS) {
    const [ada] = await db
      .select({ id: beritaKategori.id })
      .from(beritaKategori)
      .where(and(eq(beritaKategori.villageId, villageId), eq(beritaKategori.slug, item.slug)))
      .limit(1);
    if (ada) {
      kategoriIds.set(item.slug, ada.id);
    } else {
      const inserted = unwrap(
        await db
          .insert(beritaKategori)
          .values({ villageId, nama: item.nama, slug: item.slug, urut: item.urut })
          .$returningId(),
      );
      kategoriIds.set(item.slug, inserted.id);
    }
  }

  // Satu berita contoh (hanya bila desa belum punya berita sama sekali).
  const [beritaAda] = await db
    .select({ id: berita.id })
    .from(berita)
    .where(eq(berita.villageId, villageId))
    .limit(1);
  if (!beritaAda) {
    await db.insert(berita).values({
      villageId,
      kategoriId: kategoriIds.get(BERITA_CONTOH.kategoriSlug) ?? null,
      judul: BERITA_CONTOH.judul,
      slug: BERITA_CONTOH.slug,
      ringkasan: BERITA_CONTOH.ringkasan,
      isi: BERITA_CONTOH.isi,
      status: "published",
      terbitPada: new Date(),
    });
  }

  // Dokumen publik contoh.
  for (const item of DOKUMEN_SEEDS) {
    const [ada] = await db
      .select({ id: dokumenPublik.id })
      .from(dokumenPublik)
      .where(and(eq(dokumenPublik.villageId, villageId), eq(dokumenPublik.slug, item.slug)))
      .limit(1);
    if (!ada) {
      await db.insert(dokumenPublik).values({
        villageId,
        nama: item.nama,
        slug: item.slug,
        kategori: item.kategori,
        keterangan: item.keterangan,
      });
    }
  }

  // Menu publik bawaan (hanya bila desa belum punya menu).
  const [menuAda] = await db
    .select({ id: menuPublik.id })
    .from(menuPublik)
    .where(eq(menuPublik.villageId, villageId))
    .limit(1);
  if (!menuAda) {
    await db
      .insert(menuPublik)
      .values(MENU_SEEDS.map((item) => ({ villageId, ...item, parentId: null })));
  }
}

/**
 * Aktifkan tema publik bawaan bila desa belum punya tema aktif.
 *
 * Logika disalin dari `theme-repository` (bukan impor) karena skrip seed tidak
 * dapat memuat modul `server-only`. Registry tema sendiri aman diimpor.
 */
async function seedTema(villageId: number): Promise<void> {
  const [ada] = await db
    .select({ slug: theme.slug })
    .from(theme)
    .where(and(eq(theme.villageId, villageId), eq(theme.aktif, true)))
    .limit(1);

  if (ada) return;

  const manifest = DEFAULT_THEME_MANIFEST;

  await db.transaction(async (tx) => {
    await tx.update(theme).set({ aktif: false }).where(eq(theme.villageId, villageId));
    await tx
      .insert(theme)
      .values({
        villageId,
        slug: manifest.slug,
        nama: manifest.nama,
        versi: manifest.versi,
        sumber: "bawaan",
        aktif: true,
      })
      .onDuplicateKeyUpdate({ set: { aktif: true, nama: manifest.nama, versi: manifest.versi } });
  });
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
      await replaceGrants(role.slug, roleId, role.grants, slugToId);
    }
  }
  console.log("• matriks akses disiapkan");

  const adminRoleId = roleIds.get("administrator");
  if (adminRoleId === undefined) throw new Error("Role administrator tidak ditemukan.");

  await ensureAdminUser(villageId, adminRoleId);
  console.log("• pengguna administrator disiapkan");

  await seedKonten(villageId);
  console.log("• konten publik contoh disiapkan (profil, berita, galeri, dokumen, menu)");

  await seedTema(villageId);
  console.log("• tema publik bawaan diaktifkan");

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
