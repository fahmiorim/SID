import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { LETTER_STATUSES } from "@/features/surat/domain/surat";

import { users } from "./auth";
import { letterTypes } from "./letter-types";
import { residents } from "./resident";
import { villages } from "./village";

/**
 * `letters` — surat dinas desa (konsep → terbit).
 *
 * Satu baris mewakili satu surat. Saat masih `draft`, `number`/`content`/
 * `issued_at` masih kosong; `issueSuratRecord` mengisinya saat surat
 * diterbitkan. `type_name` disalin (denormalisasi) agar arsip surat tetap utuh
 * meski jenis suratnya kelak diubah atau dihapus.
 */
export const letters = mysqlTable(
  "letters",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),

    typeId: int("type_id")
      .notNull()
      .references(() => letterTypes.id, { onDelete: "restrict" }),
    residentId: int("resident_id").references(() => residents.id, { onDelete: "set null" }),

    /** Salinan nama jenis surat saat surat dibuat (denormalisasi arsip). */
    typeName: varchar("type_name", { length: 150 }).notNull(),

    /** Nomor surat final; kosong selama masih konsep. */
    number: varchar("number", { length: 50 }),
    /** Nomor urut per jenis & tahun, dipakai menyusun nomor surat. */
    sequence: int("sequence").notNull().default(0),

    status: mysqlEnum("status", LETTER_STATUSES).notNull().default("draft"),
    letterDate: varchar("letter_date", { length: 10 }).notNull(),
    year: int("year").notNull(),
    purpose: varchar("purpose", { length: 255 }),

    /** Badan surat hasil render template pada saat diterbitkan. */
    content: text("content"),

    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    issuedAt: timestamp("issued_at"),
  },
  (table) => [
    index("letters_village_type_year_idx").on(table.villageId, table.typeId, table.year),
    index("letters_village_status_idx").on(table.villageId, table.status),
  ],
);

export type Letter = typeof letters.$inferSelect;
export type NewLetter = typeof letters.$inferInsert;
