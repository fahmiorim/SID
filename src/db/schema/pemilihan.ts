import { date, int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const pemilihan = mysqlTable("pemilihan", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  tahun: int("tahun").notNull(),
  jenis: varchar("jenis", { length: 50 }).notNull(),
  tanggal: date("tanggal"),
  keterangan: text("keterangan"),
});

export type Pemilihan = typeof pemilihan.$inferSelect;
export type NewPemilihan = typeof pemilihan.$inferInsert;
