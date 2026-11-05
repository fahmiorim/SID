import { boolean, index, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

/** `mailbox_pesan` — pesan email masuk/keluar per desa (OS-OPS-005). */
export const mailboxPesan = mysqlTable(
  "mailbox_pesan",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),
    /** `masuk` atau `keluar`. */
    arah: varchar("arah", { length: 10 }).notNull(),
    alamat: varchar("alamat", { length: 255 }).notNull(),
    subjek: varchar("subjek", { length: 255 }),
    isi: text("isi").notNull(),
    dibaca: boolean("dibaca").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("mailbox_pesan_village_created_idx").on(t.villageId, t.createdAt)],
);

/** `sms_pesan` — pesan SMS masuk/keluar untuk percakapan dua arah. */
export const smsPesan = mysqlTable(
  "sms_pesan",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),
    arah: varchar("arah", { length: 10 }).notNull(),
    nomor: varchar("nomor", { length: 30 }).notNull(),
    isi: text("isi").notNull(),
    /** ID pesan dari provider (untuk deduplikasi/investigasi). */
    providerId: varchar("provider_id", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("diterima"),
    dibaca: boolean("dibaca").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sms_pesan_village_nomor_created_idx").on(t.villageId, t.nomor, t.createdAt)],
);

export type MailboxPesan = typeof mailboxPesan.$inferSelect;
export type SmsPesan = typeof smsPesan.$inferSelect;
