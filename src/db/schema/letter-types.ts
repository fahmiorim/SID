import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { letterClassifications } from "./letter-classifications";
import { villages } from "./village";

/**
 * `letter_types` — jenis/format surat (mis. Surat Keterangan Domisili,
 * Surat Undangan Rapat). Menyimpan templat badan surat, format penomoran,
 * dan masa berlaku hasil surat.
 *
 * Kode unik per desa.
 */
export const letterTypes = mysqlTable(
  "letter_types",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),

    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    classificationId: int("classification_id").references(() => letterClassifications.id, {
      onDelete: "set null",
    }),

    /** Badan surat bertemplat, memakai placeholder `[nama_desa]`, dst. */
    templateBody: text("template_body").notNull(),
    requiresResident: boolean("requires_resident").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),

    /** Pola penomoran, mis. `[kode_surat]/[nomor]/[kode_desa]/[tahun]`. */
    numberFormat: varchar("number_format", { length: 100 })
      .notNull()
      .default("[kode_surat]/[nomor]/[kode_desa]/[tahun]"),
    /** Masa berlaku surat (bulan); 0 = tidak kedaluwarsa. */
    validityMonths: int("validity_months").notNull().default(1),
    sortOrder: int("sort_order").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("letter_types_village_code_unique").on(table.villageId, table.code)],
);

export type LetterType = typeof letterTypes.$inferSelect;
export type NewLetterType = typeof letterTypes.$inferInsert;
