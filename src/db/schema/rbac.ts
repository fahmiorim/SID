import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlTable,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { config } from "./tenant";

/**
 * RBAC dengan penamaan legacy (Opsi A) — mempertahankan `user_grup`,
 * `setting_modul`, dan `grup_akses` agar katalog modul (137 entri) serta
 * matriks akses dapat diimpor 1:1 dari OpenSID.
 *
 * Semantik kolom `grup_akses.akses` dipertahankan: 0 = tidak ada, 1 = baca,
 * 3 = baca+ubah, 7 = baca+ubah+hapus. Konversi ke aksi dilakukan di lapisan kode
 * (`src/features/rbac`), bukan disimpan sebagai baris terpisah.
 */

/** `user_grup` — role. `jenis`: 1 = Sistem (terlindungi), 2 = Desa. */
export const userGrup = mysqlTable(
  "user_grup",
  {
    id: int("id").autoincrement().primaryKey(),
    configId: int("config_id").references(() => config.id, { onDelete: "set null" }),
    nama: varchar("nama", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    jenis: tinyint("jenis").notNull().default(2),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("user_grup_slug_config_uq").on(t.configId, t.slug),
    uniqueIndex("user_grup_nama_config_uq").on(t.configId, t.nama),
  ],
);

/**
 * `setting_modul` — katalog modul/resource (≈ permission resource).
 * `parent` merujuk ke `id` modul induk (0 = tanpa induk).
 */
export const settingModul = mysqlTable(
  "setting_modul",
  {
    id: int("id").autoincrement().primaryKey(),
    configId: int("config_id").references(() => config.id, { onDelete: "set null" }),
    modul: varchar("modul", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    url: varchar("url", { length: 255 }),
    aktif: boolean("aktif").notNull().default(false),
    ikon: varchar("ikon", { length: 100 }).default(""),
    ikonKecil: varchar("ikon_kecil", { length: 100 }).default(""),
    urut: int("urut"),
    level: boolean("level").notNull().default(false),
    hidden: boolean("hidden").notNull().default(false),
    parent: int("parent").default(0),
  },
  (t) => [uniqueIndex("setting_modul_slug_config_uq").on(t.configId, t.slug)],
);

/** `grup_akses` — matriks role × modul dengan kode akses 0/1/3/7. */
export const grupAkses = mysqlTable(
  "grup_akses",
  {
    id: int("id").autoincrement().primaryKey(),
    configId: int("config_id").references(() => config.id, { onDelete: "set null" }),
    idGrup: int("id_grup")
      .notNull()
      .references(() => userGrup.id, { onDelete: "cascade" }),
    idModul: int("id_modul")
      .notNull()
      .references(() => settingModul.id, { onDelete: "cascade" }),
    akses: tinyint("akses").default(0),
  },
  (t) => [
    uniqueIndex("grup_akses_grup_modul_uq").on(t.idGrup, t.idModul),
    index("grup_akses_id_modul_idx").on(t.idModul),
  ],
);

// --- Relasi (untuk query API Drizzle) -------------------------------------

export const userGrupRelations = relations(userGrup, ({ many, one }) => ({
  akses: many(grupAkses),
  config: one(config, {
    fields: [userGrup.configId],
    references: [config.id],
  }),
}));

export const settingModulRelations = relations(settingModul, ({ many, one }) => ({
  akses: many(grupAkses),
  config: one(config, {
    fields: [settingModul.configId],
    references: [config.id],
  }),
}));

export const grupAksesRelations = relations(grupAkses, ({ one }) => ({
  grup: one(userGrup, {
    fields: [grupAkses.idGrup],
    references: [userGrup.id],
  }),
  modul: one(settingModul, {
    fields: [grupAkses.idModul],
    references: [settingModul.id],
  }),
}));

export type UserGrup = typeof userGrup.$inferSelect;
export type NewUserGrup = typeof userGrup.$inferInsert;
export type SettingModul = typeof settingModul.$inferSelect;
export type NewSettingModul = typeof settingModul.$inferInsert;
export type GrupAkses = typeof grupAkses.$inferSelect;
export type NewGrupAkses = typeof grupAkses.$inferInsert;
