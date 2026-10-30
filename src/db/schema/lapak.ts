import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const lapak = mysqlTable("lapak", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  nama: varchar("nama", { length: 200 }).notNull(),
  pemilik: varchar("pemilik", { length: 100 }),
  kategori: varchar("kategori", { length: 100 }),
  alamat: text("alamat"),
  keterangan: text("keterangan"),
});

export type Lapak = typeof lapak.$inferSelect;
export type NewLapak = typeof lapak.$inferInsert;
