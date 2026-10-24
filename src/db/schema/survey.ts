import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { villages } from "./village";

export const survey = mysqlTable("survey", {
  id: int("id").autoincrement().primaryKey(),
  villageId: int("village_id")
    .notNull()
    .references(() => villages.id, { onDelete: "cascade" }),
  judul: varchar("judul", { length: 200 }).notNull(),
  deskripsi: text("deskripsi"),
  aktif: int("aktif").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const surveySoal = mysqlTable("survey_soal", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("survey_id")
    .notNull()
    .references(() => survey.id, { onDelete: "cascade" }),
  pertanyaan: text("pertanyaan").notNull(),
  /** `text` (isian), `number` (angka), atau `choice` (pilihan ganda). */
  tipe: varchar("tipe", { length: 20 }).default("text"),
  /** Daftar pilihan (JSON array string) untuk soal bertipe `choice`. */
  pilihan: text("pilihan"),
  urutan: int("urutan").default(0),
});

export const surveyResponden = mysqlTable("survey_responden", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("survey_id")
    .notNull()
    .references(() => survey.id, { onDelete: "cascade" }),
  nama: varchar("nama", { length: 150 }),
  nik: varchar("nik", { length: 16 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const surveyJawaban = mysqlTable("survey_jawaban", {
  id: int("id").autoincrement().primaryKey(),
  respondenId: int("responden_id")
    .notNull()
    .references(() => surveyResponden.id, { onDelete: "cascade" }),
  soalId: int("soal_id")
    .notNull()
    .references(() => surveySoal.id, { onDelete: "cascade" }),
  jawaban: text("jawaban"),
});
