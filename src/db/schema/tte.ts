import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const tteConfig = mysqlTable("tte_config", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).default("bsre"),
  aktif: int("aktif").default(0),
  konfigurasi: text("konfigurasi"),
});

export type TteConfig = typeof tteConfig.$inferSelect;
export type NewTteConfig = typeof tteConfig.$inferInsert;
