import { int, mysqlTable, timestamp, tinyint, varchar } from "drizzle-orm/mysql-core";

/**
 * `villages` — identitas desa sekaligus kunci tenant (multi-desa).
 *
 * Aplikasi berjalan mode satu-desa (satu baris), namun seluruh tabel
 * transaksional membawa `village_id` sehingga multi-desa dapat diaktifkan tanpa
 * perubahan skema.
 */
export const villages = mysqlTable("villages", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 100 }),
  code: varchar("code", { length: 10 }),
  postalCode: varchar("postal_code", { length: 5 }),

  /** Kecamatan (sub-distrik) beserta kode wilayahnya. */
  district: varchar("district", { length: 100 }),
  districtCode: varchar("district_code", { length: 8 }),

  /** Kabupaten/kota. */
  regency: varchar("regency", { length: 100 }),
  regencyCode: varchar("regency_code", { length: 4 }),

  /** Provinsi. */
  province: varchar("province", { length: 100 }),
  provinceCode: varchar("province_code", { length: 2 }),

  logo: varchar("logo", { length: 255 }),

  /** Gambar tanda tangan Kepala Desa (jalur media publik relatif). */
  signature: varchar("signature", { length: 255 }),

  /** Gambar stempel desa (jalur media publik relatif). */
  stamp: varchar("stamp", { length: 255 }),

  /**
   * Domain publik desa (mis. `desa-sukamaju.id`). Unik agar satu host hanya
   * menunjuk satu desa. `NULL` = belum dipetakan (mode pengembangan).
   */
  domain: varchar("domain", { length: 255 }).unique(),

  /** Nama kepala desa. */
  headName: varchar("head_name", { length: 100 }),
  /** NIP kepala desa. */
  headNip: varchar("head_nip", { length: 25 }),

  /** Mode penomoran surat layanan (1–4); lihat domain `penomoran.ts`. */
  penomoranSurat: tinyint("penomoran_surat").notNull().default(2),

  officeAddress: varchar("office_address", { length: 255 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 30 }),
  website: varchar("website", { length: 255 }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Village = typeof villages.$inferSelect;
export type NewVillage = typeof villages.$inferInsert;
