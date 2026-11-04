import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

import { users } from "./auth";
import { incomingLetters } from "./incoming-letters";
import { outgoingLetters } from "./outgoing-letters";
import { villages } from "./village";

export const incomingLetterDispositions = mysqlTable(
  "incoming_letter_dispositions",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),
    incomingLetterId: int("incoming_letter_id")
      .notNull()
      .references(() => incomingLetters.id, { onDelete: "cascade" }),
    toUserId: varchar("to_user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    toRole: varchar("to_role", { length: 50 }),
    instruction: varchar("instruction", { length: 255 }).notNull(),
    dueDate: varchar("due_date", { length: 10 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    note: varchar("note", { length: 255 }),
    dispatchedBy: varchar("dispatched_by", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("incoming_letter_dispositions_village_idx").on(table.villageId),
    index("incoming_letter_dispositions_letter_idx").on(table.incomingLetterId),
  ],
);

export const outgoingLetterShipments = mysqlTable(
  "outgoing_letter_shipments",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),
    outgoingLetterId: int("outgoing_letter_id")
      .notNull()
      .references(() => outgoingLetters.id, { onDelete: "cascade" }),
    sentDate: varchar("sent_date", { length: 10 }).notNull(),
    recipient: varchar("recipient", { length: 150 }),
    deliveryMethod: varchar("delivery_method", { length: 50 }),
    trackingNo: varchar("tracking_no", { length: 50 }),
    note: varchar("note", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("outgoing_letter_shipments_village_idx").on(table.villageId),
    index("outgoing_letter_shipments_letter_idx").on(table.outgoingLetterId),
  ],
);

export const letterAgendaLogs = mysqlTable(
  "letter_agenda_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    villageId: int("village_id")
      .notNull()
      .references(() => villages.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull(),
    letterId: int("letter_id").notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    note: varchar("note", { length: 255 }),
    actorId: varchar("actor_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("letter_agenda_logs_village_idx").on(table.villageId)],
);

export type IncomingLetterDisposition = typeof incomingLetterDispositions.$inferSelect;
export type NewIncomingLetterDisposition = typeof incomingLetterDispositions.$inferInsert;
export type OutgoingLetterShipment = typeof outgoingLetterShipments.$inferSelect;
export type NewOutgoingLetterShipment = typeof outgoingLetterShipments.$inferInsert;
export type LetterAgendaLog = typeof letterAgendaLogs.$inferSelect;
export type NewLetterAgendaLog = typeof letterAgendaLogs.$inferInsert;
