import {
  decimal,
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { users } from "./auth";
import { villages } from "./village";

/**
 * `keuangan_template` — pohon kode rekening (chart of accounts) APBDes.
 *
 * Mengikuti struktur Siskeudes: `uuid` berupa kode bertitik (`4`, `4.1`,
 * `4.1.1`, `4.1.1.01`) dan `parent_uuid` menunjuk kode di atasnya. Kolom ini
 * global (bukan per desa) karena kode rekening baku secara nasional.
 */
export const keuanganTemplate = mysqlTable(
  "keuangan_template",
  {
    uuid: varchar("uuid", { length: 20 }).primaryKey(),
    parentUuid: varchar("parent_uuid", { length: 20 }),

    uraian: varchar("uraian", { length: 255 }).notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("keuangan_template_parent_idx").on(table.parentUuid)],
);

/**
 * `keuangan` — pagu anggaran & realisasi per rekening per tahun anggaran.
 *
 * Satu baris = satu `template_uuid` pada satu `tahun` desa. Nilai induk
 * diagregasi dari anaknya oleh aplikasi (lihat `recomputeTahun`), bukan trigger,
 * agar idempoten dan mudah diuji.
 */
export const keuangan = mysqlTable(
  "keuangan",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),

    templateUuid: varchar("template_uuid", { length: 20 })
      .notNull()
      .references(() => keuanganTemplate.uuid, { onDelete: "restrict" }),

    tahun: int("tahun").notNull(),

    /** Pagu anggaran; `decimal(65,2)` agar aman dari overflow. */
    anggaran: decimal("anggaran", { precision: 65, scale: 2 }).notNull().default("0.00"),
    realisasi: decimal("realisasi", { precision: 65, scale: 2 }).notNull().default("0.00"),

    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("keuangan_village_tahun_uuid_unique").on(
      table.villageId,
      table.tahun,
      table.templateUuid,
    ),
    index("keuangan_village_tahun_idx").on(table.villageId, table.tahun),
  ],
);

export type KeuanganTemplate = typeof keuanganTemplate.$inferSelect;
export type NewKeuanganTemplate = typeof keuanganTemplate.$inferInsert;
export type Keuangan = typeof keuangan.$inferSelect;
export type NewKeuangan = typeof keuangan.$inferInsert;
