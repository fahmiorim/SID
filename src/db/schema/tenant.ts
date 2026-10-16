import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * `config` — identitas desa sekaligus kunci tenant (multi-desa).
 *
 * Mengikuti penamaan legacy (Opsi A) agar data dapat diimpor 1:1. Untuk saat
 * ini aplikasi berjalan mode satu-desa (satu baris), namun seluruh tabel
 * transaksional sudah membawa `config_id` sehingga multi-desa dapat diaktifkan
 * tanpa perubahan skema.
 */
export const config = mysqlTable("config", {
  id: int("id").autoincrement().primaryKey(),

  appKey: varchar("app_key", { length: 255 }),

  namaDesa: varchar("nama_desa", { length: 100 }),
  kodeDesa: varchar("kode_desa", { length: 10 }),
  kodePos: varchar("kode_pos", { length: 5 }),

  namaKecamatan: varchar("nama_kecamatan", { length: 100 }),
  kodeKecamatan: varchar("kode_kecamatan", { length: 8 }),
  namaKepalaCamat: varchar("nama_kepala_camat", { length: 100 }),
  nipKepalaCamat: varchar("nip_kepala_camat", { length: 30 }),

  namaKabupaten: varchar("nama_kabupaten", { length: 100 }),
  kodeKabupaten: varchar("kode_kabupaten", { length: 4 }),

  namaPropinsi: varchar("nama_propinsi", { length: 100 }),
  kodePropinsi: varchar("kode_propinsi", { length: 2 }),

  logo: varchar("logo", { length: 255 }),
  lat: varchar("lat", { length: 30 }),
  lng: varchar("lng", { length: 30 }),

  alamatKantor: varchar("alamat_kantor", { length: 255 }),
  emailDesa: varchar("email_desa", { length: 100 }),
  telepon: varchar("telepon", { length: 30 }),
  website: varchar("website", { length: 255 }),
  jamKerja: text("jam_kerja"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
