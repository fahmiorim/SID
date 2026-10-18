import {
  date,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { GENDERS, LIFE_STATUSES, RESIDENCE_STATUSES } from "@/features/penduduk/domain/penduduk";

import { families } from "./family";
import {
  bloodTypes,
  citizenships,
  educations,
  familyRelations,
  maritalStatuses,
  occupations,
  religions,
} from "./reference";
import { regions } from "./region";
import { villages } from "./village";

/**
 * `residents` — data penduduk desa.
 *
 * Kolom bertipe teks bebas dibuat *nullable* karena data sering belum lengkap
 * (mis. NIK belum tercatat). NIK unik **per desa** (nama bisa sama); beberapa
 * baris boleh ber-NIK kosong karena indeks unik MySQL mengizinkan banyak NULL.
 *
 * Keanggotaan Kartu Keluarga dinyatakan lewat `family_id`. Domisili di sini
 * adalah domisili terkini penduduk dan boleh berbeda dari domisili pada KK.
 */
export const residents = mysqlTable(
  "residents",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),

    /** Nomor Induk Kependudukan (16 angka). */
    nationalId: varchar("national_id", { length: 16 }),

    name: varchar("name", { length: 100 }).notNull(),
    gender: mysqlEnum("gender", GENDERS).notNull(),

    birthPlace: varchar("birth_place", { length: 100 }),
    birthDate: date("birth_date", { mode: "string" }),

    familyId: int("family_id").references(() => families.id, { onDelete: "set null" }),

    religionId: int("religion_id").references(() => religions.id, { onDelete: "set null" }),
    educationId: int("education_id").references(() => educations.id, { onDelete: "set null" }),
    occupationId: int("occupation_id").references(() => occupations.id, { onDelete: "set null" }),
    maritalStatusId: int("marital_status_id").references(() => maritalStatuses.id, {
      onDelete: "set null",
    }),
    familyRelationId: int("family_relation_id").references(() => familyRelations.id, {
      onDelete: "set null",
    }),
    bloodTypeId: int("blood_type_id").references(() => bloodTypes.id, { onDelete: "set null" }),
    citizenshipId: int("citizenship_id").references(() => citizenships.id, {
      onDelete: "set null",
    }),

    residenceStatus: mysqlEnum("residence_status", RESIDENCE_STATUSES)
      .notNull()
      .default("permanent"),
    lifeStatus: mysqlEnum("life_status", LIFE_STATUSES).notNull().default("alive"),

    regionId: int("region_id").references(() => regions.id, { onDelete: "set null" }),
    address: varchar("address", { length: 255 }),

    phone: varchar("phone", { length: 30 }),
    fatherName: varchar("father_name", { length: 100 }),
    motherName: varchar("mother_name", { length: 100 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("residents_village_national_id_uq").on(t.villageId, t.nationalId),
    index("residents_village_name_idx").on(t.villageId, t.name),
    index("residents_village_family_idx").on(t.villageId, t.familyId),
    index("residents_village_life_status_idx").on(t.villageId, t.lifeStatus),
    index("residents_region_idx").on(t.regionId),
  ],
);
