import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const pelanggan = mysqlTable("pelanggan", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  nama: varchar("nama", { length: 200 }).notNull(),
  kontak: varchar("kontak", { length: 100 }),
  alamat: text("alamat"),
  keterangan: text("keterangan"),
});

export type Pelanggan = typeof pelanggan.$inferSelect;
export type NewPelanggan = typeof pelanggan.$inferInsert;
