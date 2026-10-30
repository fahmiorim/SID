import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const anjungan = mysqlTable("anjungan", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  nama: varchar("nama", { length: 200 }).notNull(),
  deskripsi: text("deskripsi"),
  aktif: int("aktif").default(1),
  urutan: int("urutan").default(0),
});

export type Anjungan = typeof anjungan.$inferSelect;
export type NewAnjungan = typeof anjungan.$inferInsert;
