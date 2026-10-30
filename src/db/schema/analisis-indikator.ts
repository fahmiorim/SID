import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { analisisKategori } from "./analisis";
import { villages } from "./village";

export const analisisIndikator = mysqlTable("analisis_indikator", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  kategoriId: int("kategori_id").references(() => analisisKategori.id, { onDelete: "set null" }),
  kode: varchar("kode", { length: 20 }).notNull(),
  nama: varchar("nama", { length: 200 }).notNull(),
  keterangan: text("keterangan"),
});

export type AnalisisIndikator = typeof analisisIndikator.$inferSelect;
export type NewAnalisisIndikator = typeof analisisIndikator.$inferInsert;
