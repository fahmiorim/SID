import {
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { config } from "./tenant";

/**
 * `tweb_wil_clusterdesa` — wilayah administratif desa.
 *
 * Mempertahankan nama tabel & kolom legacy (Opsi A) agar dapat diimpor 1:1.
 * Struktur bersifat datar: satu baris merepresentasikan kombinasi dusun/RW/RT.
 *
 * Kolom `id_kepala` merujuk ke penduduk (tabel kependudukan) yang belum dibangun
 * pada tahap fondasi, sehingga untuk sementara tidak diberi foreign key.
 */
export const wilayah = mysqlTable(
  "tweb_wil_clusterdesa",
  {
    id: int("id").autoincrement().primaryKey(),
    configId: int("config_id")
      .notNull()
      .references(() => config.id, { onDelete: "cascade" }),

    dusun: varchar("dusun", { length: 100 }),
    rw: varchar("rw", { length: 10 }),
    rt: varchar("rt", { length: 10 }),

    idKepala: int("id_kepala"),

    lat: varchar("lat", { length: 30 }),
    lng: varchar("lng", { length: 30 }),
    zoom: int("zoom"),
    path: text("path"),
    mapTipe: varchar("map_tipe", { length: 30 }),
    warna: varchar("warna", { length: 30 }),
    border: varchar("border", { length: 30 }),

    urut: int("urut").default(0),
    urutCetak: int("urut_cetak").default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("wilayah_config_dusun_rw_rt_uq").on(t.configId, t.dusun, t.rw, t.rt),
    index("wilayah_config_urut_idx").on(t.configId, t.urut),
  ],
);

export type Wilayah = typeof wilayah.$inferSelect;
export type NewWilayah = typeof wilayah.$inferInsert;
