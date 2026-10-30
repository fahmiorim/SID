import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const idmIndikator = mysqlTable("idm_indikator", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  tahun: int("tahun").notNull(),
  kode: varchar("kode", { length: 20 }).notNull(),
  nama: varchar("nama", { length: 200 }).notNull(),
  skor: int("skor").default(0),
  kategori: varchar("kategori", { length: 50 }),
  keterangan: text("keterangan"),
});

export type IdmIndikator = typeof idmIndikator.$inferSelect;
export type NewIdmIndikator = typeof idmIndikator.$inferInsert;
